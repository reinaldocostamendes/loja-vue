<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import StoreHeader from '@/components/layout/StoreHeader.vue'
import StoreFooter from '@/components/layout/StoreFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const auth = useAuthStore()
const cart = useCartStore()

onMounted(() => {
  if (auth.isAuthenticated) cart.fetch()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <StoreHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <StoreFooter />
  </div>
</template>
