<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <p class="text-7xl font-black text-brand-600">404</p>
    <h1 class="mt-3 text-xl font-bold text-slate-900">Página não encontrada</h1>
    <p class="mt-2 max-w-sm text-sm text-slate-500">A página que procuras não existe ou foi movida.</p>
    <RouterLink :to="{ name: 'home' }" class="mt-6">
      <BaseButton>Voltar à loja</BaseButton>
    </RouterLink>
  </div>
</template>
