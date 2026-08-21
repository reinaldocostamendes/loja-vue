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
  user: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToastStore()
const { handle } = useApiError()

const saving = ref(false)
const errors = ref({})
const form = reactive({ name: '', email: '', password: '', role: 'client', status: 'active' })

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.name = props.user?.name || ''
      form.email = props.user?.email || ''
      form.password = ''
      form.role = props.user?.role || 'client'
      form.status = props.user?.status || 'active'
      errors.value = {}
    }
  }
)

async function submit() {
  errors.value = {}
  saving.value = true
  try {
    if (props.user) {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status }
      if (form.password) payload.password = form.password
      await adminApi.updateUser(props.user.id, payload)
      toast.success('Utilizador atualizado com sucesso.')
    } else {
      await adminApi.createUser({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success('Utilizador criado com sucesso.')
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (error) {
    errors.value = handle(error, 'Não foi possível guardar o utilizador.') || {}
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" :title="user ? 'Editar utilizador' : 'Novo utilizador'" @update:model-value="emit('update:modelValue', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Nome" required :error="errors.name" />
      <BaseInput v-model="form.email" type="email" label="Email" required :error="errors.email" />
      <BaseInput
        v-model="form.password"
        type="password"
        :label="user ? 'Nova palavra-passe' : 'Palavra-passe'"
        :hint="user ? 'Deixa em branco para manter a atual.' : 'Mínimo de 8 caracteres.'"
        :required="!user"
        :error="errors.password"
      />
      <div class="grid grid-cols-2 gap-4">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">Papel</span>
          <select v-model="form.role" class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="client">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <label v-if="user" class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">Estado</span>
          <select v-model="form.status" class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </label>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton type="button" variant="ghost" @click="emit('update:modelValue', false)">Cancelar</BaseButton>
        <BaseButton type="submit" :loading="saving">{{ user ? 'Guardar alterações' : 'Criar utilizador' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
