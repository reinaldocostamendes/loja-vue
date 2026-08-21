import { http } from './http'

export const catalogApi = {
  getCategories: () => http.get('/categories'),
  getCategory: (id) => http.get(`/categories/${id}`),
  getProducts: (params = {}) => http.get('/products', { params }),
  getProduct: (id) => http.get(`/products/${id}`),
}
