import { useAuthStore } from '../stores/authStore'

const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.token}`,
  }
}

// Dashboard
export const fetchDashboard = async () => {
  const response = await fetch('/api/admin/dashboard', {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch dashboard')
  return response.json()
}

// Products
export const fetchProducts = async () => {
  const response = await fetch('/api/admin/products', {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch products')
  return response.json()
}

export const createProduct = async (data: any) => {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create product')
  return response.json()
}

export const getProduct = async (id: string) => {
  const response = await fetch(`/api/admin/products/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch product')
  return response.json()
}

export const updateProduct = async (id: string, data: any) => {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update product')
  return response.json()
}

export const deleteProduct = async (id: string) => {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to delete product')
  return response.json()
}

// Categories
export const fetchCategories = async () => {
  const response = await fetch('/api/admin/categories', {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export const createCategory = async (data: any) => {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create category')
  return response.json()
}

export const getCategory = async (id: string) => {
  const response = await fetch(`/api/admin/categories/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch category')
  return response.json()
}

export const updateCategory = async (id: string, data: any) => {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update category')
  return response.json()
}

export const deleteCategory = async (id: string) => {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to delete category')
  return response.json()
}

// Orders
export const fetchOrders = async (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (status) params.append('status', status)

  const response = await fetch(`/api/admin/orders?${params}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

export const getOrder = async (id: string) => {
  const response = await fetch(`/api/admin/orders/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch order')
  return response.json()
}

export const updateOrder = async (id: string, data: any) => {
  const response = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update order')
  return response.json()
}

// Customers
export const fetchCustomers = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await fetch(`/api/admin/customers?${params}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch customers')
  return response.json()
}

export const getCustomer = async (id: string) => {
  const response = await fetch(`/api/admin/customers/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch customer')
  return response.json()
}

// Admin Users
export const fetchAdminUsers = async () => {
  const response = await fetch('/api/admin/admin-users', {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch admin users')
  return response.json()
}

export const createAdminUser = async (data: any) => {
  const response = await fetch('/api/admin/admin-users', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create admin user')
  return response.json()
}

export const getAdminUser = async (id: string) => {
  const response = await fetch(`/api/admin/admin-users/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch admin user')
  return response.json()
}

export const updateAdminUser = async (id: string, data: any) => {
  const response = await fetch(`/api/admin/admin-users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update admin user')
  return response.json()
}

export const deleteAdminUser = async (id: string) => {
  const response = await fetch(`/api/admin/admin-users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to delete admin user')
  return response.json()
}

// Audit Logs
export const fetchAuditLogs = async (page = 1, limit = 50) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await fetch(`/api/admin/audit-logs?${params}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch audit logs')
  return response.json()
}

// Sizes
export const fetchProductSizes = async (productId: string) => {
  const response = await fetch(`/api/admin/products/${productId}/sizes`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch product sizes')
  return response.json()
}

export const createProductSize = async (productId: string, data: any) => {
  const response = await fetch(`/api/admin/products/${productId}/sizes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create product size')
  return response.json()
}

export const updateProductSize = async (productId: string, sizeId: string, data: any) => {
  const response = await fetch(`/api/admin/products/${productId}/sizes/${sizeId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update product size')
  return response.json()
}

export const deleteProductSize = async (productId: string, sizeId: string) => {
  const response = await fetch(`/api/admin/products/${productId}/sizes/${sizeId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to delete product size')
  return response.json()
}
