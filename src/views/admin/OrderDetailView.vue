<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminApi } from '@/api/admin'
import { ordersApi } from '@/api/orders'
import { paymentsApi } from '@/api/payments'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { formatPrice, formatDate } from '@/composables/format'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ id: { type: [String, Number], required: true } })
const toast = useToastStore()
const { handle } = useApiError()

const order = ref(null)
const payments = ref([])
const loading = ref(true)
const updating = ref(false)
const nextStatus = ref('')

const methodLabels = { card: 'Cartão', mbway: 'MB WAY', multibanco: 'Multibanco' }
const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

async function load() {
  loading.value = true
  try {
    const [orderRes, paymentsRes] = await Promise.all([ordersApi.get(props.id), paymentsApi.list(props.id)])
    order.value = orderRes.order
    payments.value = paymentsRes.payments || []
    nextStatus.value = order.value.status
  } catch (error) {
    handle(error, 'Não foi possível carregar a encomenda.')
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  if (nextStatus.value === order.value.status) return
  updating.value = true
  try {
    const res = await adminApi.updateOrderStatus(order.value.id, nextStatus.value)
    order.value = res.order
    toast.success('Estado da encomenda atualizado.')
  } catch (error) {
    handle(error, 'Não foi possível atualizar o estado.')
    nextStatus.value = order.value.status
  } finally {
    updating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div v-if="loading" class="flex justify-center py-20"><Spinner size="lg" /></div>

    <template v-else-if="order">
      <RouterLink :to="{ name: 'admin-orders' }" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Encomendas
      </RouterLink>

      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-extrabold text-slate-900">Encomenda #{{ order.id }}</h1>
        <StatusBadge :status="order.status" />
      </div>

      <div class="rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Artigos</h2>
        <div class="divide-y divide-slate-100">
          <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between gap-4 py-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ item.product_name }}</p>
              <p class="text-xs text-slate-400">{{ formatPrice(item.unit_price) }} × {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-bold text-slate-900">{{ formatPrice(item.subtotal) }}</p>
          </div>
        </div>
        <div class="my-4 border-t border-dashed border-slate-200" />
        <div class="flex justify-between text-base font-extrabold text-slate-900">
          <span>Total</span>
          <span>{{ formatPrice(order.total) }}</span>
        </div>
        <p v-if="order.shipping_address" class="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <span class="font-semibold text-slate-700">Entrega em:</span> {{ order.shipping_address }}
        </p>
      </div>

      <div class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Atualizar estado</h2>
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="nextStatus"
            class="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <BaseButton :loading="updating" :disabled="nextStatus === order.status" @click="updateStatus">Guardar</BaseButton>
        </div>
      </div>

      <div v-if="payments.length > 0" class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Histórico de pagamentos</h2>
        <div class="space-y-2">
          <div v-for="payment in payments" :key="payment.id" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ methodLabels[payment.method] || payment.method }}</p>
              <p class="text-xs text-slate-400">{{ formatDate(payment.created_at) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-slate-700">{{ formatPrice(payment.amount) }}</span>
              <StatusBadge :status="payment.status" kind="payment" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
