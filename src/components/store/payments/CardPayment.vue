<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { paymentsApi } from '@/api/payments'
import { useApiError } from '@/composables/useApiError'
import { formatPrice } from '@/composables/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps({
  orderId: { type: [String, Number], required: true },
  amount: { type: [String, Number], required: true },
})
const emit = defineEmits(['paid'])
const { handle } = useApiError()

const cardMount = ref(null)
const initializing = ref(true)
const submitting = ref(false)
const cardError = ref('')
const cardComplete = ref(false)
const initError = ref('')

let stripe = null
let cardElement = null
let clientSecret = ''
let paymentId = null

async function init() {
  initializing.value = true
  initError.value = ''
  try {
    const res = await paymentsApi.initiate(props.orderId, { method: 'card' })
    paymentId = res.payment_id
    clientSecret = res.client_secret

    if (!res.publishable_key) {
      initError.value = 'A chave pública do Stripe não está configurada no servidor (STRIPE_PUBLISHABLE_KEY).'
      return
    }

    stripe = await loadStripe(res.publishable_key)
    const elements = stripe.elements()
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '15px',
          color: '#0f172a',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          '::placeholder': { color: '#94a3b8' },
        },
        invalid: { color: '#e11d48' },
      },
    })
    cardElement.mount(cardMount.value)
    cardElement.on('change', (event) => {
      cardError.value = event.error ? event.error.message : ''
      cardComplete.value = event.complete
    })
  } catch (error) {
    handle(error, 'Não foi possível iniciar o pagamento por cartão.')
  } finally {
    initializing.value = false
  }
}

async function pay() {
  if (!stripe || !cardElement || submitting.value) return
  submitting.value = true
  cardError.value = ''
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      cardError.value = error.message || 'O pagamento foi recusado.'
      return
    }

    // Sincroniza o estado com o backend (também confirma junto do Stripe)
    await paymentsApi.status(props.orderId, paymentId)

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      emit('paid')
    } else {
      emit('paid')
    }
  } catch (err) {
    handle(err, 'Não foi possível confirmar o pagamento.')
  } finally {
    submitting.value = false
  }
}

onMounted(init)
onBeforeUnmount(() => {
  cardElement?.destroy()
})
</script>

<template>
  <div>
    <div v-if="initializing" class="flex justify-center py-10">
      <Spinner size="lg" />
    </div>

    <div v-else-if="initError" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
      {{ initError }}
    </div>

    <div v-else class="space-y-4">
      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-slate-700">Dados do cartão</span>
        <div
          ref="cardMount"
          class="rounded-xl border-0 bg-white px-3.5 py-3.5 shadow-sm ring-1 ring-inset transition"
          :class="cardError ? 'ring-rose-300' : 'ring-slate-200'"
        />
        <p v-if="cardError" class="mt-1.5 text-xs font-medium text-rose-600">{{ cardError }}</p>
      </label>

      <div class="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Modo de teste Stripe: usa o número <span class="font-mono font-semibold text-slate-700">4242 4242 4242 4242</span>,
        validade futura e CVC à escolha. Para simular uma recusa, usa <span class="font-mono font-semibold text-slate-700">4000 0000 0000 0002</span>.
      </div>

      <BaseButton block size="lg" :loading="submitting" :disabled="!cardComplete" @click="pay">
        Pagar {{ formatPrice(amount) }}
      </BaseButton>
    </div>
  </div>
</template>
