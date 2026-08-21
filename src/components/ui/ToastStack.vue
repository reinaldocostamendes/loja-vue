<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const styles = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-900',
}

const icons = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <div class="fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
    <TransitionGroup name="toast" tag="div" class="flex w-full max-w-sm flex-col gap-2">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="flex items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg ring-1 ring-black/5"
        :class="styles[toast.type] || styles.info"
      >
        <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icons[toast.type] || icons.info" />
        </svg>
        <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
        <button
          class="text-white/70 transition hover:text-white"
          aria-label="Fechar"
          @click="toastStore.remove(toast.id)"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(8px) scale(0.98);
}
</style>
