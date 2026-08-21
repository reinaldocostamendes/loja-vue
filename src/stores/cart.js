import { defineStore } from 'pinia'
import { cartApi } from '@/api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
  }),
  getters: {
    count: (state) => state.items.reduce((sum, item) => sum + Number(item.quantity), 0),
    total: (state) =>
      state.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        const res = await cartApi.get()
        this.items = res.items || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async addItem(productId, quantity = 1) {
      await cartApi.addItem(productId, quantity)
      await this.fetch()
    },

    async updateItem(id, quantity) {
      await cartApi.updateItem(id, quantity)
      await this.fetch()
    },

    async removeItem(id) {
      await cartApi.removeItem(id)
      await this.fetch()
    },

    async clear() {
      await cartApi.clear()
      this.items = []
    },

    reset() {
      this.items = []
      this.loaded = false
    },
  },
})
