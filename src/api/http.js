import axios from 'axios'

export const TOKEN_KEY = 'loja_token'
export const USER_KEY = 'loja_user'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A API devolve sempre { success, message, data } ou { success:false, message, errors }.
// Aqui devolvemos diretamente `data` em caso de sucesso, e rejeitamos com um
// objeto normalizado { status, message, errors } em caso de erro.
http.interceptors.response.use(
  (response) => response.data?.data ?? null,
  (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject({
        status: 0,
        message: 'Não foi possível contactar a API. Verifique se o servidor está ligado e se VITE_API_URL está configurado corretamente.',
        errors: null,
      })
    }

    const res = error.response
    const payload = res.data || {}

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }

    return Promise.reject({
      status: res.status,
      message: payload.message || 'Ocorreu um erro inesperado.',
      errors: payload.errors || null,
    })
  }
)
