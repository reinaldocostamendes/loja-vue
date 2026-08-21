<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  kind: { type: String, default: 'order' }, // order | payment
})

const orderLabels = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const paymentLabels = {
  pending: 'Pendente',
  processing: 'A processar',
  succeeded: 'Pago',
  failed: 'Falhou',
  canceled: 'Cancelado',
}

const orderStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  completed: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-500/20',
}

const paymentStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  processing: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  succeeded: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  canceled: 'bg-slate-100 text-slate-500 ring-slate-500/20',
}

const label = computed(() => {
  const map = props.kind === 'payment' ? paymentLabels : orderLabels
  return map[props.status] || props.status
})

const style = computed(() => {
  const map = props.kind === 'payment' ? paymentStyles : orderStyles
  return map[props.status] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
})
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="style">
    {{ label }}
  </span>
</template>
