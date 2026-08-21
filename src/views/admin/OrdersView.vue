<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminApi } from '@/api/admin'
import { useApiError } from '@/composables/useApiError'
import { formatPrice, formatDate } from '@/composables/format'
import PageHeader from '@/components/admin/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const { handle } = useApiError()

const orders = ref([])
const loading = ref(true)
const statusFilter = ref('')
const state = reactive({ page: 1, totalPages: 1 })

const statuses = [
  { value: '', label: 'Todos os estados' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
]

async function load() {
  loading.value = true
  try {
    const res = await adminApi.listOrders({ status: statusFilter.value || undefined, page: state.page, per_page: 15 })
    orders.value = res.items || []
    state.totalPages = res.total_pages || 1
  } catch (error) {
    handle(error, 'Não foi possível carregar as encomendas.')
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  state.page = 1
  load()
}
function changePage(page) {
  state.page = page
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Encomendas" subtitle="Consulta e atualiza o estado das encomendas." />

    <div class="mb-4">
      <select
        v-model="statusFilter"
        class="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        @change="onFilterChange"
      >
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><Spinner size="lg" /></div>

    <EmptyState v-else-if="orders.length === 0" title="Nenhuma encomenda encontrada" />

    <template v-else>
      <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3">Encomenda</th>
              <th class="px-4 py-3">Data</th>
              <th class="px-4 py-3">Artigos</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="order in orders" :key="order.id">
              <td class="px-4 py-3 font-semibold text-slate-800">#{{ order.id }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(order.created_at) }}</td>
              <td class="px-4 py-3 text-slate-500">{{ order.items?.length || 0 }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800">{{ formatPrice(order.total) }}</td>
              <td class="px-4 py-3"><StatusBadge :status="order.status" /></td>
              <td class="px-4 py-3 text-right">
                <RouterLink :to="{ name: 'admin-order-detail', params: { id: order.id } }" class="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Ver →
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="state.page" :total-pages="state.totalPages" @change="changePage" />
    </template>
  </div>
</template>
