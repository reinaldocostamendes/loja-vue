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

const step = ref('credentials') // credentials | 2fa
const loading = ref(false)
const errors = ref({})
const preAuthToken = ref('')

const form = reactive({ email: '', password: '' })
const code = ref('')

function redirectAfterLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  cart.fetch()
  router.push(redirect || { name: 'home' })
}

async function submitCredentials() {
  errors.value = {}
  loading.value = true
  try {
    const res = await auth.login(form.email, form.password)
    if (res.requires2fa) {
      preAuthToken.value = res.preAuthToken
      step.value = '2fa'
    } else {
      toast.success(`Bem-vindo(a), ${auth.user.name.split(' ')[0]}!`)
      redirectAfterLogin()
    }
  } catch (error) {
    errors.value = handle(error, 'Não foi possível iniciar sessão.') || {}
  } finally {
    loading.value = false
  }
}

async function submitCode() {
  loading.value = true
  try {
    await auth.verify2fa(preAuthToken.value, code.value)
    toast.success(`Bem-vindo(a), ${auth.user.name.split(' ')[0]}!`)
    redirectAfterLogin()
  } catch (error) {
    handle(error, 'Código inválido.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    :title="step === 'credentials' ? 'Entrar na tua conta' : 'Verificação em dois passos'"
    :subtitle="step === 'credentials' ? 'Acede à tua conta para continuar a compra.' : 'Introduz o código de 6 dígitos da tua app autenticadora.'"
  >
    <form v-if="step === 'credentials'" class="space-y-4" @submit.prevent="submitCredentials">
      <BaseInput v-model="form.email" label="Email" type="email" autocomplete="email" required :error="errors.email" placeholder="tu@exemplo.com" />
      <BaseInput v-model="form.password" label="Palavra-passe" type="password" autocomplete="current-password" required :error="errors.password" placeholder="••••••••" />
      <BaseButton type="submit" block size="lg" :loading="loading">Entrar</BaseButton>
    </form>

    <form v-else class="space-y-4" @submit.prevent="submitCode">
      <BaseInput
        v-model="code"
        label="Código de autenticação"
        type="text"
        placeholder="123456"
        autocomplete="one-time-code"
        required
      />
      <BaseButton type="submit" block size="lg" :loading="loading">Verificar</BaseButton>
      <button type="button" class="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700" @click="step = 'credentials'">
        ← Voltar
      </button>
    </form>

    <p v-if="step === 'credentials'" class="mt-6 text-center text-sm text-slate-500">
      Ainda não tens conta?
      <RouterLink :to="{ name: 'register', query: route.query }" class="font-semibold text-brand-600 hover:text-brand-700">Criar conta</RouterLink>
    </p>
  </AuthCard>
</template>
