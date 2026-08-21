<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ordersApi } from '@/api/orders'
import { useApiError } from '@/composables/useApiError'
import { formatPrice, formatDate } from '@/composables/format'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Spinner from '@/components/ui/Spinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { handle } = useApiError()
const orders = ref([])
const loading = ref(true)
const state = reactive({ page: 1, totalPages: 1 })

async function load() {
  loading.value = true
  try {
    const res = await ordersApi.list({ page: state.page, per_page: 10 })
    orders.value = res.items || []
    state.totalPages = res.total_pages || 1
  } catch (error) {
    handle(error, 'Não foi possível carregar as encomendas.')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  state.page = page
  load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-2xl font-extrabold text-slate-900">As minhas encomendas</h1>

    <div v-if="loading" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <EmptyState v-else-if="orders.length === 0" title="Ainda não tens encomendas" description="Explora o catálogo e faz a tua primeira compra.">
      <template #action>
        <RouterLink :to="{ name: 'home' }"><BaseButton>Ver catálogo</BaseButton></RouterLink>
      </template>
    </EmptyState>

    <template v-else>
      <div class="space-y-3">
        <RouterLink
          v-for="order in orders"
          :key="order.id"
          :to="{ name: 'order-detail', params: { id: order.id } }"
          class="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition hover:ring-brand-300 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-bold text-slate-900">Encomenda #{{ order.id }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ formatDate(order.created_at) }} · {{ order.items?.length || 0 }} artigo(s)</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-slate-900">{{ formatPrice(order.total) }}</span>
            <StatusBadge :status="order.status" />
            <svg class="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </RouterLink>
      </div>
      <Pagination :page="state.page" :total-pages="state.totalPages" @change="changePage" />
    </template>
  </div>
</template>
