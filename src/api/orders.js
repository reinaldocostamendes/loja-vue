import { http } from './http'

export const ordersApi = {
  create: (shippingAddress) => http.post('/orders', { shipping_address: shippingAddress }),
  list: (params = {}) => http.get('/orders', { params }),
  get: (id) => http.get(`/orders/${id}`),
}
