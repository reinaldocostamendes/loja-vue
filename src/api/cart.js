import { http } from './http'

export const cartApi = {
  get: () => http.get('/cart'),
  addItem: (productId, quantity = 1) => http.post('/cart/items', { product_id: productId, quantity }),
  updateItem: (id, quantity) => http.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id) => http.delete(`/cart/items/${id}`),
  clear: () => http.delete('/cart'),
}
