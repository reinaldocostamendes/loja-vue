<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminApi } from '@/api/admin'
import { useApiError } from '@/composables/useApiError'
import { formatPrice, formatDate } from '@/composables/format'
import PageHeader from '@/components/admin/PageHeader.vue'
import StatCard from '@/components/admin/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useAuthStore } from '@/stores/auth'

const { handle } = useApiError()
const auth = useAuthStore()

const loading = ref(true)
const stats = ref({ products: 0, orders: 0, users: 0, pending: 0 })
const recentOrders = ref([])

async function load() {
  loading.value = true
  try {
    const [products, orders, users, pendingOrders] = await Promise.all([
      adminApi.listProducts({ per_page: 1 }),
      adminApi.listOrders({ per_page: 5 }),
      adminApi.listUsers({ per_page: 1 }),
      adminApi.listOrders({ status: 'pending', per_page: 1 }),
    ])
    stats.value = {
      products: products.total || 0,
      orders: orders.total || 0,
      users: users.total || 0,
      pending: pendingOrders.total || 0,
    }
    recentOrders.value = orders.items || []
  } catch (error) {
    handle(error, 'Não foi possível carregar o resumo.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader :title="`Olá, ${auth.user?.name?.split(' ')[0] || ''}`" subtitle="Aqui está um resumo da tua loja." />

    <div v-if="loading" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Produtos" :value="stats.products" accent="brand" icon="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0H3.75M10 11.25h4" />
        <StatCard label="Encomendas" :value="stats.orders" accent="sky" icon="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75" />
        <StatCard label="Encomendas pendentes" :value="stats.pending" accent="amber" icon="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Utilizadores" :value="stats.users" accent="emerald" icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766" />
      </div>

      <div class="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Encomendas recentes</h2>
          <RouterLink :to="{ name: 'admin-orders' }" class="text-sm font-semibold text-brand-600 hover:text-brand-700">Ver todas →</RouterLink>
        </div>

        <p v-if="recentOrders.length === 0" class="py-8 text-center text-sm text-slate-400">Ainda não há encomendas.</p>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th class="pb-3 pr-4">Encomenda</th>
                <th class="pb-3 pr-4">Data</th>
                <th class="pb-3 pr-4">Total</th>
                <th class="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="order in recentOrders" :key="order.id" class="text-slate-700">
                <td class="py-3 pr-4">
                  <RouterLink :to="{ name: 'admin-order-detail', params: { id: order.id } }" class="font-semibold text-slate-800 hover:text-brand-700">
                    #{{ order.id }}
                  </RouterLink>
                </td>
                <td class="py-3 pr-4 text-slate-500">{{ formatDate(order.created_at) }}</td>
                <td class="py-3 pr-4 font-semibold">{{ formatPrice(order.total) }}</td>
                <td class="py-3"><StatusBadge :status="order.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
