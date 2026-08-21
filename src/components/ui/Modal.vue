<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
})
const emit = defineEmits(['update:modelValue'])

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" @click.self="close">
        <Transition name="modal-panel" appear>
          <div
            v-if="modelValue"
            class="w-full rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
            :class="sizes[size] || sizes.md"
          >
            <div class="mb-4 flex items-start justify-between gap-4">
              <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
              <button class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="close">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
.modal-panel-enter-active {
  transition: all 0.2s ease;
}
.modal-panel-leave-active {
  transition: all 0.15s ease;
}
.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
