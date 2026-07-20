<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchCustomers } from '../../lib/adminApi'

interface Customer {
  id: string
  fullName: string
  email: string
  phone: string
  isNewsletterSubscriber: boolean
  createdAt: string
}

const customers = ref<Customer[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const page = ref(1)
const limit = ref(20)

const hasCustomers = computed(() => customers.value.length > 0)

const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetchCustomers(page.value, limit.value)
    
    // Handle both formats: { customers: [...] } and [...]
    let customersData = []
    
    if (Array.isArray(response)) {
      // If response is directly an array
      customersData = response
    } else if (response?.customers && Array.isArray(response.customers)) {
      // If response has customers property
      customersData = response.customers
    }
    
    customers.value = customersData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching customers'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('es-ES')
  } catch {
    return date
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
        <div class="text-sm text-gray-600">
          Total: {{ customers.length }}
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 font-semibold">Error:</p>
        <p class="text-red-700">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando clientes...</div>
      </div>

      <div v-else-if="!hasCustomers" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800">No hay clientes para mostrar</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700">Newsletter</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700">Desde</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">{{ customer.fullName }}</td>
                <td class="px-6 py-4 text-gray-700">{{ customer.email }}</td>
                <td class="px-6 py-4 text-gray-700">{{ customer.phone }}</td>
                <td class="px-6 py-4">
                  <span v-if="customer.isNewsletterSubscriber" class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Suscrito</span>
                  <span v-else class="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">No suscrito</span>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ formatDate(customer.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
