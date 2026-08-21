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
  category: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToastStore()
const { handle } = useApiError()

const saving = ref(false)
const errors = ref({})
const form = reactive({ name: '', description: '' })

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.name = props.category?.name || ''
      form.description = props.category?.description || ''
      errors.value = {}
    }
  }
)

async function submit() {
  errors.value = {}
  saving.value = true
  try {
    const payload = { name: form.name, description: form.description || null }
    if (props.category) {
      await adminApi.updateCategory(props.category.id, payload)
      toast.success('Categoria atualizada com sucesso.')
    } else {
      await adminApi.createCategory(payload)
      toast.success('Categoria criada com sucesso.')
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    errors.value = handle(error, 'Não foi possível guardar a categoria.') || {}
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" :title="category ? 'Editar categoria' : 'Nova categoria'" @update:model-value="emit('update:modelValue', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Nome" required :error="errors.name" />
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
        <BaseButton type="submit" :loading="saving">{{ category ? 'Guardar alterações' : 'Criar categoria' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
