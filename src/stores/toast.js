import { defineStore } from 'pinia'

let nextId = 1

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),
  actions: {
    push(message, type = 'info', timeout = 4000) {
      const id = nextId++
      this.toasts.push({ id, message, type })
      if (timeout) {
        setTimeout(() => this.remove(id), timeout)
      }
      return id
    },
    success(message, timeout) {
      return this.push(message, 'success', timeout)
    },
    error(message, timeout) {
      return this.push(message, 'error', timeout ?? 6000)
    },
    info(message, timeout) {
      return this.push(message, 'info', timeout)
    },
    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
