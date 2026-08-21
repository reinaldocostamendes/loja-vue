import { useToastStore } from '@/stores/toast'

/**
 * Devolve uma função para tratar erros da API de forma consistente:
 * mostra a mensagem principal num toast e, se existirem erros de
 * validação por campo, devolve-os para serem apresentados no formulário.
 */
export function useApiError() {
  const toast = useToastStore()

  function handle(error, fallback = 'Ocorreu um erro inesperado.') {
    const message = error?.message || fallback
    toast.error(message)
    return error?.errors || null
  }

  return { handle }
}
