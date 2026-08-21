<script setup>
import { ref, reactive, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { authApi } from '@/api/auth'
import { initials, formatDate } from '@/composables/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Modal from '@/components/ui/Modal.vue'

const auth = useAuthStore()
const toast = useToastStore()
const { handle } = useApiError()

const loadingMe = ref(true)

// Ativação de 2FA
const setupOpen = ref(false)
const setupStep = ref('qr') // qr | confirm
const setupData = reactive({ secret: '', otpauthUrl: '' })
const confirmCode = ref('')
const settingUp = ref(false)

// Desativação de 2FA
const disableOpen = ref(false)
const disablePassword = ref('')
const disabling = ref(false)

async function refreshMe() {
  loadingMe.value = true
  try {
    await auth.fetchMe()
  } catch (error) {
    handle(error, 'Não foi possível carregar os dados da conta.')
  } finally {
    loadingMe.value = false
  }
}

async function startSetup() {
  settingUp.value = true
  try {
    const res = await authApi.setup2fa()
    setupData.secret = res.secret
    setupData.otpauthUrl = res.otpauth_url
    setupStep.value = 'qr'
    confirmCode.value = ''
    setupOpen.value = true
  } catch (error) {
    handle(error, 'Não foi possível iniciar a ativação do 2FA.')
  } finally {
    settingUp.value = false
  }
}

async function confirmSetup() {
  settingUp.value = true
  try {
    await authApi.confirm2fa(confirmCode.value)
    toast.success('Autenticação de dois fatores ativada com sucesso.')
    setupOpen.value = false
    await refreshMe()
  } catch (error) {
    handle(error, 'Código inválido.')
  } finally {
    settingUp.value = false
  }
}

async function confirmDisable() {
  disabling.value = true
  try {
    await authApi.disable2fa(disablePassword.value)
    toast.success('Autenticação de dois fatores desativada.')
    disableOpen.value = false
    disablePassword.value = ''
    await refreshMe()
  } catch (error) {
    handle(error, 'Palavra-passe incorreta.')
  } finally {
    disabling.value = false
  }
}

onMounted(refreshMe)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-2xl font-extrabold text-slate-900">A minha conta</h1>

    <div class="rounded-2xl bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
      <div class="flex items-center gap-4">
        <span class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
          {{ initials(auth.user?.name) }}
        </span>
        <div>
          <p class="text-lg font-bold text-slate-900">{{ auth.user?.name }}</p>
          <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
          <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            {{ auth.user?.role === 'admin' ? 'Administrador' : 'Cliente' }}
          </p>
        </div>
      </div>
      <p v-if="auth.user?.created_at" class="mt-4 text-xs text-slate-400">
        Conta criada em {{ formatDate(auth.user.created_at) }}
      </p>
    </div>

    <div class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Autenticação de dois fatores</h2>
          <p class="mt-1 text-sm text-slate-500">
            Adiciona uma camada extra de segurança com uma app autenticadora (Google Authenticator, Authy, etc.).
          </p>
        </div>
        <span
          class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="auth.user?.two_factor_enabled ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-500 ring-slate-500/20'"
        >
          {{ auth.user?.two_factor_enabled ? 'Ativo' : 'Inativo' }}
        </span>
      </div>

      <div class="mt-5">
        <BaseButton v-if="!auth.user?.two_factor_enabled" :loading="settingUp" @click="startSetup">
          Ativar 2FA
        </BaseButton>
        <BaseButton v-else variant="outline" @click="disableOpen = true">
          Desativar 2FA
        </BaseButton>
      </div>
    </div>

    <!-- Modal: ativar 2FA -->
    <Modal v-model="setupOpen" title="Ativar autenticação de dois fatores">
      <div v-if="setupStep === 'qr'" class="space-y-4">
        <p class="text-sm text-slate-600">
          Digitaliza este código QR na tua app autenticadora, ou introduz a chave manualmente.
        </p>
        <div class="flex justify-center rounded-xl bg-slate-50 p-5">
          <QrcodeVue :value="setupData.otpauthUrl" :size="180" level="M" />
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p class="break-all font-mono text-xs text-slate-600">{{ setupData.secret }}</p>
        </div>
        <BaseInput v-model="confirmCode" label="Código de 6 dígitos" placeholder="123456" required />
        <BaseButton block :loading="settingUp" @click="confirmSetup">Confirmar e ativar</BaseButton>
      </div>
    </Modal>

    <!-- Modal: desativar 2FA -->
    <Modal v-model="disableOpen" title="Desativar autenticação de dois fatores">
      <div class="space-y-4">
        <p class="text-sm text-slate-600">Por segurança, confirma a tua palavra-passe atual.</p>
        <BaseInput v-model="disablePassword" type="password" label="Palavra-passe" required autocomplete="current-password" />
        <BaseButton block variant="danger" :loading="disabling" @click="confirmDisable">Desativar 2FA</BaseButton>
      </div>
    </Modal>
  </div>
</template>
