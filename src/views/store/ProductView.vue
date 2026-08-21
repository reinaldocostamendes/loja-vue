<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { catalogApi } from '@/api/catalog'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import ProductImage from '@/components/store/ProductImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps({ id: { type: [String, Number], required: true } })

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()
const { handle } = useApiError()

const product = ref(null)
const loading = ref(true)
const notFound = ref(false)
const quantity = ref(1)
const adding = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    const res = await catalogApi.getProduct(props.id)
    product.value = res.product
    quantity.value = 1
  } catch (error) {
    if (error.status === 404) {
      notFound.value = true
    } else {
      handle(error, 'Não foi possível carregar o produto.')
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load)
onMounted(load)

function inc() {
  if (quantity.value < Number(product.value.stock)) quantity.value++
}
function dec() {
  if (quantity.value > 1) quantity.value--
}

async function handleAdd() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  adding.value = true
  try {
    await cart.addItem(product.value.id, quantity.value)
    toast.success(`"${product.value.name}" adicionado ao carrinho.`)
  } catch (error) {
    handle(error, 'Não foi possível adicionar o produto.')
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex justify-center py-24">
      <Spinner size="lg" />
    </div>

    <div v-else-if="notFound" class="py-24 text-center">
      <p class="text-lg font-semibold text-slate-800">Produto não encontrado</p>
      <RouterLink :to="{ name: 'home' }" class="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">← Voltar ao catálogo</RouterLink>
    </div>

    <div v-else-if="product" class="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div class="max-w-md">
        <ProductImage :src="product.image" :alt="product.name" />
      </div>

      <div>
        <RouterLink :to="{ name: 'home' }" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Catálogo
        </RouterLink>

        <p v-if="product.category_name" class="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
          {{ product.category_name }}
        </p>
        <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">{{ product.name }}</h1>
        <p class="mt-4 text-3xl font-black text-slate-900">{{ formatPrice(product.price) }}</p>

        <p class="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {{ product.description || 'Sem descrição disponível para este produto.' }}
        </p>

        <div class="mt-6">
          <span
            v-if="Number(product.stock) <= 0"
            class="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-600/20"
          >
            Esgotado
          </span>
          <span
            v-else
            class="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          >
            Em stock ({{ product.stock }} disponíveis)
          </span>
        </div>

        <div v-if="Number(product.stock) > 0" class="mt-8 flex items-center gap-4">
          <div class="flex items-center rounded-xl ring-1 ring-slate-200">
            <button class="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-slate-900" @click="dec">−</button>
            <span class="w-8 text-center text-sm font-bold text-slate-900">{{ quantity }}</span>
            <button class="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-slate-900" @click="inc">+</button>
          </div>
          <BaseButton size="lg" class="flex-1" :loading="adding" @click="handleAdd">
            Adicionar ao carrinho
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
