<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' },
  accent: { type: String, default: 'brand' }, // brand | emerald | amber | sky
})

const accents = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
}
</script>

<template>
  <div class="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-slate-500">{{ label }}</p>
      <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="accents[accent]">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
        </svg>
      </span>
    </div>
    <p class="mt-3 text-3xl font-extrabold text-slate-900">{{ value }}</p>
  </div>
</template>
