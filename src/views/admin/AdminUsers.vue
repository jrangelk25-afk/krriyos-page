<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { fetchAdminUsers, deleteAdminUser } from '../../lib/adminApi'

interface AdminUser {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
}

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    loading.value = true
    users.value = await fetchAdminUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error fetching users'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro?')) {
    try {
      await deleteAdminUser(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting user'
    }
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
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Usuarios Admin</h1>
        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <span class="material-symbols-outlined">add</span>
          Nuevo Usuario
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-gray-500">Cargando usuarios...</div>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Rol</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Último acceso</th>
              <th class="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">{{ user.fullName }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Nunca' }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button class="text-blue-600 hover:text-blue-800">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button @click="handleDelete(user.id)" class="text-red-600 hover:text-red-800">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
