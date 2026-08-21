<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { catalogApi } from '@/api/catalog'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import PageHeader from '@/components/admin/PageHeader.vue'
import ProductFormModal from '@/components/admin/ProductFormModal.vue'
import ProductImage from '@/components/store/ProductImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const toast = useToastStore()
const { handle } = useApiError()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const state = reactive({ page: 1, totalPages: 1 })

const modalOpen = ref(false)
const editingProduct = ref(null)
const deletingId = ref(null)

let searchTimeout = null

async function loadCategories() {
  try {
    const res = await catalogApi.getCategories()
    categories.value = res.categories || []
  } catch (error) {
    handle(error, 'Não foi possível carregar as categorias.')
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await adminApi.listProducts({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      page: state.page,
      per_page: 10,
    })
    products.value = res.items || []
    state.totalPages = res.total_pages || 1
  } catch (error) {
    handle(error, 'Não foi possível carregar os produtos.')
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    state.page = 1
    loadProducts()
  }, 350)
}

function onFilterChange() {
  state.page = 1
  loadProducts()
}

function changePage(page) {
  state.page = page
  loadProducts()
}

function openCreate() {
  editingProduct.value = null
  modalOpen.value = true
}
function openEdit(product) {
  editingProduct.value = product
  modalOpen.value = true
}

async function remove(product) {
  if (!confirm(`Remover o produto "${product.name}"? Esta ação não pode ser desfeita.`)) return
  deletingId.value = product.id
  try {
    await adminApi.deleteProduct(product.id)
    toast.success('Produto removido.')
    await loadProducts()
  } catch (error) {
    handle(error, 'Não foi possível remover o produto.')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<template>
  <div>
    <PageHeader title="Produtos" subtitle="Gere o catálogo da tua loja.">
      <template #actions>
        <BaseButton @click="openCreate">
          <template #icon>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </template>
          Novo produto
        </BaseButton>
      </template>
    </PageHeader>

    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Pesquisar produtos..."
        class="w-full max-w-xs rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        @input="onSearchInput"
      />
      <select
        v-model="statusFilter"
        class="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        @change="onFilterChange"
      >
        <option value="">Todos os estados</option>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><Spinner size="lg" /></div>

    <EmptyState v-else-if="products.length === 0" title="Nenhum produto encontrado" description="Cria o teu primeiro produto para começar a vender." />

    <template v-else>
      <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3">Produto</th>
              <th class="px-4 py-3">Categoria</th>
              <th class="px-4 py-3">Preço</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="product in products" :key="product.id">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-11 shrink-0"><ProductImage :src="product.image" :alt="product.name" /></div>
                  <span class="line-clamp-1 font-semibold text-slate-800">{{ product.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ product.category_name || '—' }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800">{{ formatPrice(product.price) }}</td>
              <td class="px-4 py-3 text-slate-500">{{ product.stock }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                  :class="product.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-500 ring-slate-500/20'"
                >
                  {{ product.status === 'active' ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="openEdit(product)">
                    <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  </button>
                  <button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" :disabled="deletingId === product.id" @click="remove(product)">
                    <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="state.page" :total-pages="state.totalPages" @change="changePage" />
    </template>

    <ProductFormModal v-model="modalOpen" :product="editingProduct" :categories="categories" @saved="loadProducts" />
  </div>
</template>
