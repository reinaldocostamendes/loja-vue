<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['change'])

const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < props.totalPages)
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-4">
    <button
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canPrev"
      @click="emit('change', page - 1)"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="px-3 text-sm font-medium text-slate-600">Página {{ page }} de {{ totalPages }}</span>
    <button
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canNext"
      @click="emit('change', page + 1)"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>
