<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchOrders } from '../../lib/adminApi'

interface Order {
  id: string
  orderNumber: string
  customer: { fullName: string }
  total: string | number
  status: string
  createdAt: string
}

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    loading.value = true
    const data = await fetchOrders()
    orders.value = data.orders
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching orders'
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
  return new Date(date).toLocaleDateString('es-ES')
}

onMounted(fetchData)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Órdenes</h1>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando órdenes...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Número</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Cliente</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Total</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Fecha</th>
              <th class="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-mono">{{ order.orderNumber }}</td>
              <td class="px-6 py-4">{{ order.customer.fullName }}</td>
              <td class="px-6 py-4 font-medium">{{ formatCurrency(order.total) }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                ]">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4">{{ formatDate(order.createdAt) }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="router.push(`/admin/orders/${order.id}`)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
