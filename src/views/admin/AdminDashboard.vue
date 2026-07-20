<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import SizesSummary from '../../components/admin/SizesSummary.vue'

interface DashboardStats {
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalRevenue: number | string
}

interface Order {
  id: string
  orderNumber: string
  customer: { fullName: string }
  customerId: string
  total: string | number
  status: string
  createdAt: string
}

interface Product {
  id: string
  sku: string
  name: string
  price: string | number
  stock: number
}

const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)

const stats = ref<DashboardStats>({
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  totalRevenue: 0,
})

const recentOrders = ref<Order[]>([])
const lowStockProducts = ref<Product[]>([])

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const token = authStore.token
    const response = await fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch dashboard data')
    const data = await response.json()
    stats.value = data.stats
    recentOrders.value = data.recentOrders
    lowStockProducts.value = data.lowStockProducts
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching data'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboardData)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800'
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente'
    case 'PROCESSING':
      return 'En proceso'
    case 'SHIPPED':
      return 'Enviado'
    case 'DELIVERED':
      return 'Entregado'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return status
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-gray-600">Bienvenido a tu panel de administración</p>
      </div>

      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <p class="text-gray-500">Cargando panel...</p>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p class="text-gray-600 text-sm font-medium">Órdenes Totales</p>
            <p class="text-4xl font-bold text-gray-900 mt-2">{{ stats.totalOrders }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <p class="text-gray-600 text-sm font-medium">Ingresos Totales</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatCurrency(stats.totalRevenue as number) }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <p class="text-gray-600 text-sm font-medium">Productos</p>
            <p class="text-4xl font-bold text-gray-900 mt-2">{{ stats.totalProducts }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <p class="text-gray-600 text-sm font-medium">Clientes</p>
            <p class="text-4xl font-bold text-gray-900 mt-2">{{ stats.totalCustomers }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Órdenes Recientes</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Número</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id" class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-3 px-4">{{ order.orderNumber }}</td>
                  <td class="py-3 px-4">{{ order.customer.fullName }}</td>
                  <td class="py-3 px-4 font-semibold">{{ formatCurrency(parseFloat(order.total as string)) }}</td>
                  <td class="py-3 px-4">
                    <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getStatusColor(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4">{{ formatDate(order.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="lowStockProducts.length > 0" class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Productos con Stock Bajo</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in lowStockProducts" :key="product.id" class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-3 px-4 font-mono text-xs">{{ product.sku }}</td>
                  <td class="py-3 px-4">{{ product.name }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      {{ product.stock }} unidades
                    </span>
                  </td>
                  <td class="py-3 px-4 font-semibold">{{ formatCurrency(parseFloat(product.price as string)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resumen de Tallas -->
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Gestión de Tallas e Inventario</h2>
          <SizesSummary />
        </div>
      </template>
    </div>
  </AdminLayout>
</template>
