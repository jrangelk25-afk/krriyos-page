<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchAuditLogs } from '../../lib/adminApi'

interface AuditLog {
  id: string
  adminUser: { fullName: string }
  action: string
  tableName: string
  createdAt: string
}

const logs = ref<AuditLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    loading.value = true
    const data = await fetchAuditLogs()
    logs.value = data.logs
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching logs'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-ES')
}

onMounted(fetchData)
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Auditoría</h1>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando registros...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Usuario</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Acción</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Tabla</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">{{ log.adminUser.fullName }}</td>
              <td class="px-6 py-4">{{ log.action }}</td>
              <td class="px-6 py-4 font-mono text-xs">{{ log.tableName }}</td>
              <td class="px-6 py-4 text-gray-600">{{ formatDate(log.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
