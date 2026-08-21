<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { paymentsApi } from '@/api/payments'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { formatPrice, formatDate } from '@/composables/format'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  orderId: { type: [String, Number], required: true },
  amount: { type: [String, Number], required: true },
})
const emit = defineEmits(['paid'])
const auth = useAuthStore()
const toast = useToastStore()
const { handle } = useApiError()

const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const submitting = ref(false)
const checking = ref(false)
const errors = ref({})
const reference = ref(null)

let paymentId = null
let pollTimer = null

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(checkStatus, 15000)
}

async function checkStatus(silent = true) {
  if (!paymentId) return
  if (!silent) checking.value = true
  try {
    const res = await paymentsApi.status(props.orderId, paymentId)
    if (res.payment.status === 'succeeded') {
      stopPolling()
      emit('paid')
    } else if (!silent) {
      toast.info('Ainda não recebemos a confirmação do pagamento.')
    }
  } catch (error) {
    if (!silent) handle(error, 'Não foi possível verificar o estado do pagamento.')
  } finally {
    checking.value = false
  }
}

async function submit() {
  errors.value = {}
  if (!name.value.trim() || !email.value.trim()) {
    errors.value = {
      name: !name.value.trim() ? 'Indica o teu nome.' : undefined,
      email: !email.value.trim() ? 'Indica o teu email.' : undefined,
    }
    return
  }
  submitting.value = true
  try {
    const res = await paymentsApi.initiate(props.orderId, {
      method: 'multibanco',
      name: name.value.trim(),
      email: email.value.trim(),
    })
    paymentId = res.payment_id
    reference.value = res
    startPolling()
  } catch (error) {
    errors.value = handle(error, 'Não foi possível gerar a referência Multibanco.') || {}
  } finally {
    submitting.value = false
  }
}

function copy(text) {
  navigator.clipboard?.writeText(text)
  toast.success('Copiado.')
}

onBeforeUnmount(stopPolling)
</script>

<template>
  <div>
    <div v-if="reference" class="space-y-4">
      <div class="rounded-2xl bg-slate-50 p-5">
        <p class="mb-4 text-center text-sm font-medium text-slate-600">Paga com esta referência num ATM ou no teu homebanking</p>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <p class="text-xs font-semibold uppercase text-slate-400">Entidade</p>
            <button class="mt-1 font-mono text-lg font-bold text-slate-900" @click="copy(reference.entity)">{{ reference.entity }}</button>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase text-slate-400">Referência</p>
            <button class="mt-1 font-mono text-lg font-bold text-slate-900" @click="copy(reference.reference)">{{ reference.reference }}</button>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase text-slate-400">Montante</p>
            <p class="mt-1 text-lg font-bold text-slate-900">{{ formatPrice(reference.amount) }}</p>
          </div>
        </div>
        <p v-if="reference.expires_at" class="mt-4 text-center text-xs text-slate-400">
          Válida até {{ formatDate(reference.expires_at) }}
        </p>
        <p class="mt-2 text-center text-xs text-slate-400">(Toca num valor para copiar)</p>
      </div>

      <BaseButton block variant="outline" :loading="checking" @click="checkStatus(false)">
        Já paguei — verificar estado
      </BaseButton>
      <p class="text-center text-xs text-slate-400">Esta página atualiza-se automaticamente assim que o pagamento for confirmado.</p>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="name" label="Nome" :error="errors.name" required />
      <BaseInput v-model="email" type="email" label="Email" :error="errors.email" required />
      <div class="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Vamos gerar uma entidade e referência Multibanco para pagares no ATM ou homebanking.
      </div>
      <BaseButton type="submit" block size="lg" :loading="submitting">
        Gerar referência de {{ formatPrice(amount) }}
      </BaseButton>
    </form>
  </div>
</template>
