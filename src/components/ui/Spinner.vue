<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
  class: { type: String, default: '' },
})

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' }
</script>

<template>
  <span
    class="inline-block animate-spin rounded-full border-brand-600 border-t-transparent"
    :class="[sizes[size] || sizes.md, $props.class]"
    role="status"
    aria-label="A carregar"
  />
</template>
