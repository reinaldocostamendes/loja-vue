<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { catalogApi } from '@/api/catalog'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import ProductCard from '@/components/store/ProductCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Spinner from '@/components/ui/Spinner.vue'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()
const { handle } = useApiError()

const categories = ref([])
const products = ref([])
const loading = ref(true)
const addingId = ref(null)
const searchInput = ref('')

const state = reactive({
  search: '',
  categoryId: null,
  page: 1,
  totalPages: 1,
  total: 0,
})

let searchTimeout = null
watch(searchInput, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    state.search = value
    state.page = 1
    loadProducts()
  }, 350)
})

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
    const res = await catalogApi.getProducts({
      search: state.search || undefined,
      category_id: state.categoryId || undefined,
      page: state.page,
      per_page: 12,
    })
    products.value = res.items || []
    state.totalPages = res.total_pages || 1
    state.total = res.total || 0
  } catch (error) {
    handle(error, 'Não foi possível carregar os produtos.')
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  state.categoryId = id
  state.page = 1
  loadProducts()
}

function changePage(page) {
  state.page = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleAdd(product) {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  addingId.value = product.id
  try {
    await cart.addItem(product.id, 1)
    toast.success(`"${product.name}" adicionado ao carrinho.`)
  } catch (error) {
    handle(error, 'Não foi possível adicionar o produto.')
  } finally {
    addingId.value = null
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-500">
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 20%, white 1px, transparent 1px); background-size: 24px 24px" />
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
          Pagamentos com Cartão, MB WAY e Multibanco
        </p>
        <h1 class="max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Tudo o que precisas, a um clique de distância.
        </h1>
        <p class="mt-3 max-w-lg text-sm text-brand-100 sm:text-base">
          Descobre o nosso catálogo e paga da forma que preferires — em segundos.
        </p>

        <div class="relative mt-8 max-w-md">
          <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Procurar produtos..."
            class="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-lg shadow-brand-900/20 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <!-- Categorias -->
      <div class="mb-8 flex flex-wrap gap-2">
        <button
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="state.categoryId === null ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
          @click="selectCategory(null)"
        >
          Todas
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="state.categoryId === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Grelha de produtos -->
      <div v-if="loading" class="flex justify-center py-24">
        <Spinner size="lg" />
      </div>

      <EmptyState
        v-else-if="products.length === 0"
        title="Nenhum produto encontrado"
        description="Tenta ajustar a pesquisa ou escolhe outra categoria."
      />

      <template v-else>
        <p class="mb-4 text-sm text-slate-500">{{ state.total }} produto(s) encontrado(s)</p>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :adding="addingId === product.id"
            @add="handleAdd"
          />
        </div>
        <Pagination :page="state.page" :total-pages="state.totalPages" @change="changePage" />
      </template>
    </div>
  </div>
</template>
