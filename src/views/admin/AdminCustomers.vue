<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const fetchData = async () => {
  try {
    loading.value = true
    const data = await fetchCustomers()
    customers.value = data.customers
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching customers'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

onMounted(fetchData)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando clientes...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
              <td class="px-6 py-4">{{ customer.fullName }}</td>
              <td class="px-6 py-4">{{ customer.email }}</td>
              <td class="px-6 py-4">{{ customer.phone }}</td>
              <td class="px-6 py-4">
                <span v-if="customer.isNewsletterSubscriber" class="text-green-600">✓</span>
                <span v-else class="text-gray-400">✗</span>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ formatDate(customer.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
