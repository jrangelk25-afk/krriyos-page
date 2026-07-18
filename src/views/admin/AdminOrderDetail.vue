<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { getOrder, updateOrder } from '../../lib/adminApi'

interface Order {
  id: string
  orderNumber: string
  customer: { fullName: string; email: string }
  address: string
  city: string
  country: string
  zipCode: string
  status: string
  subtotal: string | number
  tax: string | number
  total: string | number
  items: Array<{
    id: string
    product: { name: string }
    size: string
    color?: string
    quantity: number
    unitPrice: string | number
    subtotal: string | number
  }>
}

const router = useRouter()
const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const newStatus = ref('')

const orderId = route.params.id as string

const fetchOrder = async () => {
  try {
    loading.value = true
    order.value = await getOrder(orderId)
    if (order.value) {
      newStatus.value = order.value.status
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching order'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async () => {
  try {
    await updateOrder(orderId, { status: newStatus.value })
    await fetchOrder()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error updating order'
  }
}

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(parseFloat(String(value)))
}

onMounted(fetchOrder)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <button @click="router.back()" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver
      </button>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando orden...</div>
      </div>

      <div v-else-if="order" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ order.orderNumber }}</h1>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600">Cliente</p>
              <p class="text-lg font-medium text-gray-900">{{ order.customer.fullName }}</p>
              <p class="text-sm text-gray-600">{{ order.customer.email }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Dirección</p>
              <p class="text-gray-900">{{ order.address }}, {{ order.city }}</p>
              <p class="text-gray-900">{{ order.country }} {{ order.zipCode }}</p>
            </div>
          </div>
        </div>

        <!-- Status Update -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <label class="block mb-2 font-medium text-gray-900">Estado de la orden</label>
          <div class="flex gap-4">
            <select v-model="newStatus" class="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="PENDING">Pendiente</option>
              <option value="PROCESSING">En proceso</option>
              <option value="SHIPPED">Enviada</option>
              <option value="DELIVERED">Entregada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
            <button
              @click="updateOrderStatus"
              :disabled="newStatus === order.status"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Artículos</h2>
          <table class="w-full text-sm">
            <thead class="border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4">Producto</th>
                <th class="text-left py-3 px-4">Talla</th>
                <th class="text-left py-3 px-4">Color</th>
                <th class="text-left py-3 px-4">Cantidad</th>
                <th class="text-left py-3 px-4">Precio</th>
                <th class="text-left py-3 px-4">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id" class="border-b border-gray-200">
                <td class="py-3 px-4">{{ item.product.name }}</td>
                <td class="py-3 px-4">{{ item.size }}</td>
                <td class="py-3 px-4">{{ item.color || '-' }}</td>
                <td class="py-3 px-4">{{ item.quantity }}</td>
                <td class="py-3 px-4">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="py-3 px-4 font-medium">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="space-y-2 text-right">
            <p class="text-gray-600">Subtotal: <span class="font-semibold">{{ formatCurrency(order.subtotal) }}</span></p>
            <p class="text-lg font-bold text-gray-900">Total: <span class="text-blue-600">{{ formatCurrency(order.total) }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
