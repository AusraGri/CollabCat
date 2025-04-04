import { useErrorStore } from '@/stores/errorStore'
import type { DefaultMessagesType } from '@/stores/errorStore'

export function setErrorMessage(params: {
  message?: string
  messageKey?: keyof DefaultMessagesType
}) {
  const { message, messageKey } = params
  const errorStore = useErrorStore()
  errorStore.setError({ message, messageKey })
}
