<script setup>
import { reactive, watch, ref } from 'vue'
import { adminApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import Modal from '@/components/ui/Modal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToastStore()
const { handle } = useApiError()

const saving = ref(false)
const errors = ref({})
const form = reactive({
  name: '',
  category_id: '',
  price: '',
  stock: 0,
  image: '',
  description: '',
  status: 'active',
})

function resetForm(product) {
  form.name = product?.name || ''
  form.category_id = product?.category_id ?? ''
  form.price = product?.price ?? ''
  form.stock = product?.stock ?? 0
  form.image = product?.image || ''
  form.description = product?.description || ''
  form.status = product?.status || 'active'
  errors.value = {}
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm(props.product)
  }
)

async function submit() {
  errors.value = {}
  saving.value = true
  try {
    const payload = {
      name: form.name,
      category_id: form.category_id === '' ? null : Number(form.category_id),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image || null,
      description: form.description || null,
      status: form.status,
    }
    if (props.product) {
      await adminApi.updateProduct(props.product.id, payload)
      toast.success('Produto atualizado com sucesso.')
    } else {
      await adminApi.createProduct(payload)
      toast.success('Produto criado com sucesso.')
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    errors.value = handle(error, 'Não foi possível guardar o produto.') || {}
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" :title="product ? 'Editar produto' : 'Novo produto'" size="lg" @update:model-value="emit('update:modelValue', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Nome" required :error="errors.name" />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">Categoria</span>
          <select v-model="form.category_id" class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Sem categoria</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">Estado</span>
          <select v-model="form.status" class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.price" type="number" step="0.01" min="0" label="Preço (€)" required :error="errors.price" />
        <BaseInput v-model="form.stock" type="number" min="0" label="Stock" required :error="errors.stock" />
      </div>

      <BaseInput v-model="form.image" label="URL da imagem" placeholder="https://..." :error="errors.image" />

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-slate-700">Descrição</span>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton type="button" variant="ghost" @click="emit('update:modelValue', false)">Cancelar</BaseButton>
        <BaseButton type="submit" :loading="saving">{{ product ? 'Guardar alterações' : 'Criar produto' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
