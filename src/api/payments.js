import { http } from './http'

export const paymentsApi = {
  list: (orderId) => http.get(`/orders/${orderId}/payments`),
  initiate: (orderId, data) => http.post(`/orders/${orderId}/payments`, data),
  status: (orderId, paymentId) => http.get(`/orders/${orderId}/payments/${paymentId}/status`),
}
