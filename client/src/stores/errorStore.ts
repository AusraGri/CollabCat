import { defineStore } from 'pinia'

const defaultMessages = {
  create: `Failed to create new #object. Please try again.`,
  update: 'Failed to update #object. Please try again',
  delete: 'Failed to delete #object. Please try again',
  read: 'Failed to get #object. Please try again',
  login: 'Login failed. Please check your credentials.',
  network: 'Network error. Please check your connection.',
}

export type DefaultMessagesType = typeof defaultMessages
export const useErrorStore = defineStore('errorStore', {
  state: () => ({
    errorMessage: '',
    defaultMessages,
  }),
  actions: {
    setError(params: { messageKey?: keyof DefaultMessagesType; message?: string }) {
      const { messageKey, message } = params
      if (!messageKey && message) {
        this.errorMessage = message
      } else if (messageKey && message) {
        this.errorMessage = this.defaultMessages[messageKey].replace('#object', message)
      } else {
        this.errorMessage = 'An error occurred.'
      }
    },
    clearError() {
      this.errorMessage = ''
    },
  },
})

export type ErrorStore = ReturnType<typeof useErrorStore>
