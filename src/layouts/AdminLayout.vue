<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" @click="sidebarOpen = true">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-bold text-slate-900">Backoffice</span>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
