<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import AuthCard from '@/components/ui/AuthCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const { handle } = useApiError()

const loading = ref(false)
const errors = ref({})
const form = reactive({ name: '', email: '', password: '' })

async function submit() {
  errors.value = {}
  loading.value = true
  try {
    await auth.register({ ...form })
    toast.success('Conta criada com sucesso!')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    cart.fetch()
    router.push(redirect || { name: 'home' })
  } catch (error) {
    errors.value = handle(error, 'Não foi possível criar a conta.') || {}
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard title="Criar conta" subtitle="Regista-te para começares a comprar.">
    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Nome" autocomplete="name" required :error="errors.name" placeholder="O teu nome" />
      <BaseInput v-model="form.email" label="Email" type="email" autocomplete="email" required :error="errors.email" placeholder="tu@exemplo.com" />
      <BaseInput
        v-model="form.password"
        label="Palavra-passe"
        type="password"
        autocomplete="new-password"
        required
        :error="errors.password"
        hint="Mínimo de 8 caracteres."
        placeholder="••••••••"
      />
      <BaseButton type="submit" block size="lg" :loading="loading">Criar conta</BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Já tens conta?
      <RouterLink :to="{ name: 'login', query: route.query }" class="font-semibold text-brand-600 hover:text-brand-700">Entrar</RouterLink>
    </p>
  </AuthCard>
</template>
