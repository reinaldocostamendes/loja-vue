<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ordersApi } from '@/api/orders'
import { paymentsApi } from '@/api/payments'
import { useApiError } from '@/composables/useApiError'
import { useToastStore } from '@/stores/toast'
import { formatPrice, formatDate } from '@/composables/format'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PaymentPanel from '@/components/store/payments/PaymentPanel.vue'

const props = defineProps({ id: { type: [String, Number], required: true } })
const { handle } = useApiError()
const toast = useToastStore()

const order = ref(null)
const payments = ref([])
const loading = ref(true)
const justPaid = ref(false)

const methodLabels = { card: 'Cartão', mbway: 'MB WAY', multibanco: 'Multibanco' }

const isPending = computed(() => order.value?.status === 'pending')

async function load() {
  loading.value = true
  try {
    const [orderRes, paymentsRes] = await Promise.all([ordersApi.get(props.id), paymentsApi.list(props.id)])
    order.value = orderRes.order
    payments.value = paymentsRes.payments || []
  } catch (error) {
    handle(error, 'Não foi possível carregar a encomenda.')
  } finally {
    loading.value = false
  }
}

async function handlePaid() {
  justPaid.value = true
  toast.success('Pagamento confirmado! A tua encomenda está paga.')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <template v-else-if="order">
      <RouterLink :to="{ name: 'orders' }" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        As minhas encomendas
      </RouterLink>

      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-extrabold text-slate-900">Encomenda #{{ order.id }}</h1>
        <StatusBadge :status="order.status" />
      </div>

      <div
        v-if="justPaid || order.status === 'paid'"
        class="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-600/20"
      >
        <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium">A tua encomenda está paga! Vamos prepará-la para envio.</p>
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

      <div v-if="isPending" class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-base font-bold text-slate-900">Escolhe como pagar</h2>
        <PaymentPanel :order-id="order.id" :amount="order.total" @paid="handlePaid" />
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
