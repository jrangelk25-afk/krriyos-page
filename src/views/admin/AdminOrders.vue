<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchOrders } from '../../lib/adminApi'

interface Order {
  id: string
  orderNumber: string
  customer: { fullName: string; email: string }
  total: string | number
  status: string
  createdAt: string
  items: any[]
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

const router = useRouter()
const orders = ref<Order[]>([])
const pagination = ref<PaginationInfo>({
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
})
const loading = ref(true)
const error = ref<string | null>(null)
const selectedStatus = ref<string>('')
const currentPage = ref(1)

const fetchData = async (page = 1, status = '') => {
  try {
    loading.value = true
    const data = await fetchOrders(page, 20, status || undefined)
    orders.value = data.orders || []
    pagination.value = data.pagination || {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
    }
    currentPage.value = page
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching orders'
    console.error('Error fetching orders:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(parseFloat(String(value)))
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadgeClass = (status: string) => {
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
  const labels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'PROCESSING': 'En Proceso',
    'SHIPPED': 'Enviada',
    'DELIVERED': 'Entregada',
    'CANCELLED': 'Cancelada',
  }
  return labels[status] || status
}

const handleStatusFilter = (status: string) => {
  selectedStatus.value = status
  fetchData(1, status)
}

const goToPage = (page: number) => {
  fetchData(page, selectedStatus.value)
}

const viewOrder = (orderId: string) => {
  router.push(`/admin/orders/${orderId}`)
}

onMounted(() => fetchData())
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Órdenes</h1>
        <div class="text-sm text-gray-600">
          Total: <span class="font-bold text-gray-900">{{ pagination.total }}</span>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Filtros de estado -->
      <div class="flex gap-2 flex-wrap">
        <button
          @click="handleStatusFilter('')"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === '' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Todas
        </button>
        <button
          @click="handleStatusFilter('PENDING')"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === 'PENDING' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          ]"
        >
          Pendientes
        </button>
        <button
          @click="handleStatusFilter('PROCESSING')"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === 'PROCESSING' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          ]"
        >
          En Proceso
        </button>
        <button
          @click="handleStatusFilter('SHIPPED')"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === 'SHIPPED' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          ]"
        >
          Enviadas
        </button>
        <button
          @click="handleStatusFilter('DELIVERED')"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === 'DELIVERED' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          ]"
        >
          Entregadas
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando órdenes...</div>
      </div>

      <div v-else-if="orders.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <p class="text-gray-600">No hay órdenes para mostrar</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Número</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Cliente</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Artículos</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Total</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Fecha</th>
              <th class="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-mono text-xs font-bold">{{ order.orderNumber }}</td>
              <td class="px-6 py-4">{{ order.customer?.fullName || 'N/A' }}</td>
              <td class="px-6 py-4 text-xs text-gray-600">{{ order.customer?.email || 'N/A' }}</td>
              <td class="px-6 py-4 text-center">
                <span class="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {{ order.items?.length || 0 }}
                </span>
              </td>
              <td class="px-6 py-4 font-medium">{{ formatCurrency(order.total) }}</td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeClass(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-gray-600">{{ formatDate(order.createdAt) }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="viewOrder(order.id)"
                  class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
                  title="Ver detalles"
                >
                  <span class="material-symbols-outlined text-lg">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.pages > 1" class="flex justify-center items-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Anterior
        </button>
        <div class="flex gap-1">
          <button
            v-for="page in pagination.pages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg border font-medium',
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === pagination.pages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  </AdminLayout>
</template>
