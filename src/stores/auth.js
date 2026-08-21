import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { TOKEN_KEY, USER_KEY } from '@/api/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    ready: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    init() {
      const token = localStorage.getItem(TOKEN_KEY)
      const userRaw = localStorage.getItem(USER_KEY)
      if (token && userRaw) {
        try {
          this.token = token
          this.user = JSON.parse(userRaw)
        } catch {
          this.clearSession()
        }
      }
      this.ready = true
    },

    persistSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    async register(data) {
      const res = await authApi.register(data)
      this.persistSession(res.token, res.user)
      return res
    },

    /**
     * Devolve { requires2fa: true, preAuthToken } se a conta tiver 2FA
     * ativo, ou { requires2fa: false } após sessão iniciada com sucesso.
     */
    async login(email, password) {
      const res = await authApi.login({ email, password })
      if (res.requires_2fa) {
        return { requires2fa: true, preAuthToken: res.pre_auth_token }
      }
      this.persistSession(res.token, res.user)
      return { requires2fa: false }
    },

    async verify2fa(preAuthToken, code) {
      const res = await authApi.verify2fa({ pre_auth_token: preAuthToken, code })
      this.persistSession(res.token, res.user)
      return res
    },

    async fetchMe() {
      const res = await authApi.me()
      this.user = res.user
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      return res.user
    },

    async logout() {
      try {
        await authApi.logout()
      } catch {
        // O token é sem estado — mesmo que o pedido falhe, terminamos localmente.
      }
      this.clearSession()
    },
  },
})
