<script setup>
import { RouterLink } from 'vue-router'
import { formatPrice } from '@/composables/format'
import ProductImage from './ProductImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  product: { type: Object, required: true },
  adding: { type: Boolean, default: false },
})
const emit = defineEmits(['add'])
</script>

<template>
  <div class="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
    <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="block p-3">
      <ProductImage :src="product.image" :alt="product.name" />
    </RouterLink>
    <div class="flex flex-1 flex-col px-4 pb-4">
      <p v-if="product.category_name" class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
        {{ product.category_name }}
      </p>
      <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-brand-700">
        {{ product.name }}
      </RouterLink>
      <div class="mt-3 flex items-end justify-between gap-2">
        <span class="text-lg font-extrabold text-slate-900">{{ formatPrice(product.price) }}</span>
        <span v-if="Number(product.stock) <= 0" class="text-xs font-medium text-rose-500">Esgotado</span>
        <span v-else-if="Number(product.stock) <= 5" class="text-xs font-medium text-amber-600">Últimas {{ product.stock }}</span>
      </div>
      <BaseButton
        size="sm"
        class="mt-3"
        block
        :disabled="Number(product.stock) <= 0"
        :loading="adding"
        @click="emit('add', product)"
      >
        <template #icon>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.94-4.693 2.442-7.152.083-.409-.263-.826-.686-.826H5.106M7.5 14.25L5.106 5.25" />
          </svg>
        </template>
        Adicionar
      </BaseButton>
    </div>
  </div>
</template>
