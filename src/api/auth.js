import { http } from './http'

export const authApi = {
  register: (data) => http.post('/auth/register', data),
  login: (data) => http.post('/auth/login', data),
  verify2fa: (data) => http.post('/auth/2fa/verify', data),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me'),
  setup2fa: () => http.post('/auth/2fa/setup'),
  confirm2fa: (code) => http.post('/auth/2fa/confirm', { code }),
  disable2fa: (password) => http.post('/auth/2fa/disable', { password }),
}
