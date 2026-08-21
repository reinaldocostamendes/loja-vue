import { http } from './http'

export const adminApi = {
  // Utilizadores
  listUsers: (params = {}) => http.get('/admin/users', { params }),
  getUser: (id) => http.get(`/admin/users/${id}`),
  createUser: (data) => http.post('/admin/users', data),
  updateUser: (id, data) => http.put(`/admin/users/${id}`, data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`),

  // Categorias
  createCategory: (data) => http.post('/admin/categories', data),
  updateCategory: (id, data) => http.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/admin/categories/${id}`),

  // Produtos
  listProducts: (params = {}) => http.get('/admin/products', { params }),
  getProduct: (id) => http.get(`/admin/products/${id}`),
  createProduct: (data) => http.post('/admin/products', data),
  updateProduct: (id, data) => http.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => http.delete(`/admin/products/${id}`),

  // Encomendas
  listOrders: (params = {}) => http.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => http.put(`/admin/orders/${id}/status`, { status }),
}
