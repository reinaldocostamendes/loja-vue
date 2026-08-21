<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { initials } from '@/composables/format'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const menuOpen = ref(false)
const mobileOpen = ref(false)

async function handleLogout() {
  menuOpen.value = false
  await auth.logout()
  cart.reset()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 font-extrabold text-slate-900">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3h1.5l1.5 13.5h11.25M6.75 16.5h11.25l1.5-9H5.25M9 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </span>
        <span class="text-lg tracking-tight">Loja</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          :to="{ name: 'home' }"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          active-class="!text-brand-700 bg-brand-50"
        >
          Catálogo
        </RouterLink>
        <RouterLink
          v-if="auth.isAuthenticated"
          :to="{ name: 'orders' }"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          active-class="!text-brand-700 bg-brand-50"
        >
          As minhas encomendas
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin"
          :to="{ name: 'admin-dashboard' }"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Backoffice
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <RouterLink
          :to="{ name: 'cart' }"
          class="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Carrinho"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.94-4.693 2.442-7.152.083-.409-.263-.826-.686-.826H5.106M7.5 14.25L5.106 5.25M7.5 14.25L4.5 10.5m9 6.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.75 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span
            v-if="cart.count > 0"
            class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <div v-if="auth.isAuthenticated" class="relative">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 transition hover:bg-brand-200"
            @click="menuOpen = !menuOpen"
          >
            {{ initials(auth.user?.name) || '?' }}
          </button>
          <Transition name="fade">
            <div
              v-if="menuOpen"
              class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/5"
              @click="menuOpen = false"
            >
              <div class="border-b border-slate-100 px-4 py-2.5">
                <p class="truncate text-sm font-semibold text-slate-900">{{ auth.user?.name }}</p>
                <p class="truncate text-xs text-slate-500">{{ auth.user?.email }}</p>
              </div>
              <RouterLink :to="{ name: 'account' }" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">A minha conta</RouterLink>
              <RouterLink :to="{ name: 'orders' }" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Encomendas</RouterLink>
              <RouterLink v-if="auth.isAdmin" :to="{ name: 'admin-dashboard' }" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Backoffice</RouterLink>
              <button class="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50" @click="handleLogout">Terminar sessão</button>
            </div>
          </Transition>
        </div>
        <RouterLink v-else :to="{ name: 'login' }" class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700">
          Entrar
        </RouterLink>

        <button class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden" @click="mobileOpen = !mobileOpen">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="fade">
      <nav v-if="mobileOpen" class="border-t border-slate-100 bg-white px-4 py-2 md:hidden" @click="mobileOpen = false">
        <RouterLink :to="{ name: 'home' }" class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Catálogo</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" :to="{ name: 'orders' }" class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">As minhas encomendas</RouterLink>
        <RouterLink v-if="auth.isAdmin" :to="{ name: 'admin-dashboard' }" class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Backoffice</RouterLink>
      </nav>
    </Transition>
  </header>
</template>
