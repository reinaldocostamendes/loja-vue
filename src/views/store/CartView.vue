<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import ProductImage from '@/components/store/ProductImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Spinner from '@/components/ui/Spinner.vue'

const cart = useCartStore()
const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const { handle } = useApiError()

const busyId = ref(null)

async function updateQuantity(item, quantity) {
  if (quantity < 1) return
  if (quantity > Number(item.stock)) {
    toast.error('Não há stock suficiente para essa quantidade.')
    return
  }
  busyId.value = item.id
  try {
    await cart.updateItem(item.id, quantity)
  } catch (error) {
    handle(error, 'Não foi possível atualizar o carrinho.')
  } finally {
    busyId.value = null
  }
}

async function removeItem(item) {
  busyId.value = item.id
  try {
    await cart.removeItem(item.id)
    toast.info(`"${item.product_name}" removido do carrinho.`)
  } catch (error) {
    handle(error, 'Não foi possível remover o produto.')
  } finally {
    busyId.value = null
  }
}

function goToCheckout() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  router.push({ name: 'checkout' })
}

onMounted(() => {
  if (auth.isAuthenticated) cart.fetch()
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-2xl font-extrabold text-slate-900">Carrinho</h1>

    <div v-if="!auth.isAuthenticated" class="py-10">
      <EmptyState title="Inicia sessão para ver o teu carrinho" description="É necessário ter conta para adicionar produtos ao carrinho.">
        <template #action>
          <RouterLink :to="{ name: 'login', query: { redirect: '/carrinho' } }">
            <BaseButton>Entrar</BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <div v-else-if="cart.loading && !cart.loaded" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <div v-else-if="cart.items.length === 0" class="py-10">
      <EmptyState title="O teu carrinho está vazio" description="Adiciona produtos do catálogo para começares a tua encomenda.">
        <template #action>
          <RouterLink :to="{ name: 'home' }">
            <BaseButton>Ver catálogo</BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-2">
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70"
        >
          <RouterLink :to="{ name: 'product', params: { id: item.product_id } }" class="w-20 shrink-0">
            <ProductImage :src="item.image" :alt="item.product_name" />
          </RouterLink>
          <div class="min-w-0 flex-1">
            <RouterLink :to="{ name: 'product', params: { id: item.product_id } }" class="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-700">
              {{ item.product_name }}
            </RouterLink>
            <p class="mt-1 text-sm font-bold text-slate-900">{{ formatPrice(item.price) }}</p>
            <p v-if="item.product_status !== 'active'" class="mt-1 text-xs font-medium text-rose-500">Produto indisponível</p>
          </div>
          <div class="flex items-center rounded-lg ring-1 ring-slate-200">
            <button
              class="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40"
              :disabled="busyId === item.id"
              @click="updateQuantity(item, item.quantity - 1)"
            >
              −
            </button>
            <span class="w-7 text-center text-sm font-bold text-slate-900">{{ item.quantity }}</span>
            <button
              class="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40"
              :disabled="busyId === item.id"
              @click="updateQuantity(item, item.quantity + 1)"
            >
              +
            </button>
          </div>
          <p class="w-20 shrink-0 text-right text-sm font-bold text-slate-900">{{ formatPrice(item.subtotal) }}</p>
          <button
            class="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
            :disabled="busyId === item.id"
            @click="removeItem(item)"
          >
            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div class="h-fit rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-base font-bold text-slate-900">Resumo</h2>
        <div class="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span class="font-semibold text-slate-900">{{ formatPrice(cart.total) }}</span>
        </div>
        <div class="mt-2 flex justify-between text-sm text-slate-600">
          <span>Envio</span>
          <span class="font-semibold text-emerald-600">Grátis</span>
        </div>
        <div class="my-4 border-t border-dashed border-slate-200" />
        <div class="flex justify-between text-base font-extrabold text-slate-900">
          <span>Total</span>
          <span>{{ formatPrice(cart.total) }}</span>
        </div>
        <BaseButton block size="lg" class="mt-6" @click="goToCheckout">Finalizar compra</BaseButton>
      </div>
    </div>
  </div>
</template>
