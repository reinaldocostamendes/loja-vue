<script setup>
import { RouterView } from 'vue-router'
import ToastStack from '@/components/ui/ToastStack.vue'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <ToastStack />
</template>
