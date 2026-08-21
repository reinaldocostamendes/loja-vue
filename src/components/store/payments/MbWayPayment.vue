<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { paymentsApi } from '@/api/payments'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps({
  orderId: { type: [String, Number], required: true },
  amount: { type: [String, Number], required: true },
})
const emit = defineEmits(['paid'])
const { handle } = useApiError()

const phone = ref('')
const submitting = ref(false)
const errors = ref({})
const waiting = ref(false)
const failedMsg = ref('')

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
  pollTimer = setInterval(async () => {
    try {
      const res = await paymentsApi.status(props.orderId, paymentId)
      if (res.payment.status === 'succeeded') {
        stopPolling()
        waiting.value = false
        emit('paid')
      } else if (res.payment.status === 'failed' || res.payment.status === 'canceled') {
        stopPolling()
        waiting.value = false
        failedMsg.value = res.payment.status === 'failed'
          ? 'O pagamento foi recusado. Podes tentar novamente.'
          : 'O pagamento foi cancelado. Podes tentar novamente.'
      }
    } catch {
      // ignora falhas pontuais de polling
    }
  }, 3000)
}

async function submit() {
  errors.value = {}
  failedMsg.value = ''
  if (!phone.value.trim()) {
    errors.value = { phone: 'Indica o número associado ao MB WAY.' }
    return
  }
  submitting.value = true
  try {
    const res = await paymentsApi.initiate(props.orderId, { method: 'mbway', phone: phone.value.trim() })
    paymentId = res.payment_id
    waiting.value = true
    startPolling()
  } catch (error) {
    errors.value = handle(error, 'Não foi possível iniciar o pagamento MB WAY.') || {}
  } finally {
    submitting.value = false
  }
}

function retry() {
  waiting.value = false
  failedMsg.value = ''
}

onBeforeUnmount(stopPolling)
</script>

<template>
  <div>
    <div v-if="waiting" class="flex flex-col items-center gap-4 py-6 text-center">
      <Spinner size="lg" />
      <div>
        <p class="text-sm font-semibold text-slate-900">A aguardar aprovação na app MB WAY…</p>
        <p class="mt-1 text-sm text-slate-500">Abre a app MB WAY no teu telemóvel e aprova o pagamento de {{ formatPrice(amount) }}.</p>
      </div>
    </div>

    <div v-else class="space-y-4">
      <p v-if="failedMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{{ failedMsg }}</p>

      <BaseInput
        v-model="phone"
        label="Número de telemóvel"
        placeholder="912 345 678"
        :error="errors.phone"
        hint="Número português associado à app MB WAY (com ou sem indicativo +351)."
        required
      />

      <div class="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Em modo de teste, o Stripe aprova automaticamente o pagamento ao fim de alguns segundos.
      </div>

      <BaseButton block size="lg" :loading="submitting" @click="submit">
        Pagar {{ formatPrice(amount) }} com MB WAY
      </BaseButton>
    </div>
  </div>
</template>
