<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))
</script>

<template>
  <div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
      loading="lazy"
      @error="failed = true"
    />
    <svg v-else class="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 4.5h18v15H3v-15zM9 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  </div>
</template>
