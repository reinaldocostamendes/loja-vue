<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import { ordersApi } from '@/api/orders'
import ProductImage from '@/components/store/ProductImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const cart = useCartStore()
const router = useRouter()
const { handle } = useApiError()

const address = ref('')
const submitting = ref(false)
const loadingCart = ref(true)
const errors = ref({})

async function submit() {
  errors.value = {}
  if (!address.value.trim()) {
    errors.value = { shipping_address: 'Indica a morada de entrega.' }
    return
  }
  submitting.value = true
  try {
    const res = await ordersApi.create(address.value.trim())
    router.push({ name: 'order-detail', params: { id: res.order.id } })
  } catch (error) {
    errors.value = handle(error, 'Não foi possível criar a encomenda.') || {}
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loadingCart.value = true
  try {
    await cart.fetch()
  } finally {
    loadingCart.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-2xl font-extrabold text-slate-900">Finalizar compra</h1>

    <div v-if="loadingCart" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <EmptyState v-else-if="cart.items.length === 0" title="O teu carrinho está vazio" description="Adiciona produtos antes de finalizar a compra.">
      <template #action>
        <RouterLink :to="{ name: 'home' }"><BaseButton>Ver catálogo</BaseButton></RouterLink>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <form class="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70 lg:col-span-2" @submit.prevent="submit">
        <h2 class="text-base font-bold text-slate-900">Morada de entrega</h2>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">Morada completa <span class="text-rose-500">*</span></span>
          <textarea
            v-model="address"
            rows="4"
            placeholder="Rua, número, código-postal, localidade"
            class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2"
            :class="errors.shipping_address ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-200 focus:ring-brand-500'"
          />
          <p v-if="errors.shipping_address" class="mt-1.5 text-xs font-medium text-rose-600">
            {{ Array.isArray(errors.shipping_address) ? errors.shipping_address[0] : errors.shipping_address }}
          </p>
        </label>

        <div class="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          Depois de confirmares a encomenda, escolhes o método de pagamento — Cartão, MB WAY ou Multibanco.
        </div>

        <BaseButton type="submit" block size="lg" :loading="submitting">Confirmar encomenda</BaseButton>
      </form>

      <div class="h-fit rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <h2 class="mb-4 text-base font-bold text-slate-900">Resumo</h2>
        <div class="max-h-64 space-y-3 overflow-y-auto pr-1">
          <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-3">
            <div class="w-12 shrink-0"><ProductImage :src="item.image" :alt="item.product_name" /></div>
            <div class="min-w-0 flex-1">
              <p class="line-clamp-1 text-sm font-medium text-slate-700">{{ item.product_name }}</p>
              <p class="text-xs text-slate-400">Qtd. {{ item.quantity }}</p>
            </div>
            <p class="shrink-0 text-sm font-semibold text-slate-900">{{ formatPrice(item.subtotal) }}</p>
          </div>
        </div>
        <div class="my-4 border-t border-dashed border-slate-200" />
        <div class="flex justify-between text-base font-extrabold text-slate-900">
          <span>Total</span>
          <span>{{ formatPrice(cart.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
