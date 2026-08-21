<script setup>
import { ref, onMounted } from 'vue'
import { catalogApi } from '@/api/catalog'
import { adminApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import PageHeader from '@/components/admin/PageHeader.vue'
import CategoryFormModal from '@/components/admin/CategoryFormModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const toast = useToastStore()
const { handle } = useApiError()

const categories = ref([])
const loading = ref(true)
const modalOpen = ref(false)
const editingCategory = ref(null)
const deletingId = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await catalogApi.getCategories()
    categories.value = res.categories || []
  } catch (error) {
    handle(error, 'Não foi possível carregar as categorias.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingCategory.value = null
  modalOpen.value = true
}
function openEdit(category) {
  editingCategory.value = category
  modalOpen.value = true
}

async function remove(category) {
  if (!confirm(`Remover a categoria "${category.name}"? Os produtos associados ficam sem categoria.`)) return
  deletingId.value = category.id
  try {
    await adminApi.deleteCategory(category.id)
    toast.success('Categoria removida.')
    await load()
  } catch (error) {
    handle(error, 'Não foi possível remover a categoria.')
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Categorias" subtitle="Organiza os teus produtos por categoria.">
      <template #actions>
        <BaseButton @click="openCreate">
          <template #icon>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </template>
          Nova categoria
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex justify-center py-20"><Spinner size="lg" /></div>

    <EmptyState v-else-if="categories.length === 0" title="Ainda não há categorias" description="Cria categorias para organizar o catálogo." />

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="cat in categories" :key="cat.id" class="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
        <div class="mb-3 flex items-start justify-between">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.169.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
          </span>
          <div class="flex gap-1">
            <button class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="openEdit(cat)">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            </button>
            <button class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" :disabled="deletingId === cat.id" @click="remove(cat)">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" /></svg>
            </button>
          </div>
        </div>
        <p class="font-semibold text-slate-800">{{ cat.name }}</p>
        <p class="mt-1 text-xs text-slate-400">/{{ cat.slug }}</p>
        <p v-if="cat.description" class="mt-2 line-clamp-2 text-sm text-slate-500">{{ cat.description }}</p>
      </div>
    </div>

    <CategoryFormModal v-model="modalOpen" :category="editingCategory" @saved="load" />
  </div>
</template>
