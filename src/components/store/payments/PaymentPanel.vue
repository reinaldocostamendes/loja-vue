<script setup>
import { ref } from 'vue'
import CardPayment from './CardPayment.vue'
import MbWayPayment from './MbWayPayment.vue'
import MultibancoPayment from './MultibancoPayment.vue'

const props = defineProps({
  orderId: { type: [String, Number], required: true },
  amount: { type: [String, Number], required: true },
})
const emit = defineEmits(['paid'])

const methods = [
  { id: 'card', label: 'Cartão', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z' },
  { id: 'mbway', label: 'MB WAY', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
  { id: 'multibanco', label: 'Multibanco', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.625c.621 0 1.125.504 1.125 1.125v.375m-18 0h18M3.75 18.75h16.5' },
]

const active = ref('card')
</script>

<template>
  <div>
    <div class="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
      <button
        v-for="method in methods"
        :key="method.id"
        class="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition sm:flex-row sm:justify-center sm:gap-2 sm:text-sm"
        :class="active === method.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="active = method.id"
      >
        <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" :d="method.icon" />
        </svg>
        {{ method.label }}
      </button>
    </div>

    <CardPayment v-if="active === 'card'" :key="'card-' + orderId" :order-id="orderId" :amount="amount" @paid="emit('paid')" />
    <MbWayPayment v-else-if="active === 'mbway'" :key="'mbway-' + orderId" :order-id="orderId" :amount="amount" @paid="emit('paid')" />
    <MultibancoPayment v-else :key="'mb-' + orderId" :order-id="orderId" :amount="amount" @paid="emit('paid')" />
  </div>
</template>
