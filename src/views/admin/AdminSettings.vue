<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import AdminLayout from '../../components/admin/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = ref<any>({})
const success = ref(false)
const loading = ref(false)

const handleChangePassword = async () => {
  errors.value = {}
  success.value = false

  if (!passwordForm.value.currentPassword) {
    errors.value.currentPassword = 'La contraseña actual es requerida'
  }

  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    errors.value.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres'
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
  }

  if (Object.keys(errors.value).length === 0) {
    loading.value = true
    // TODO: Implement password change endpoint
    setTimeout(() => {
      success.value = true
      loading.value = false
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    }, 1000)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <h1 class="text-3xl font-bold text-gray-900">Configuración</h1>

      <!-- Profile Info -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Información de perfil</h2>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">Email</p>
            <p class="font-medium text-gray-900">{{ authStore.admin?.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Nombre</p>
            <p class="font-medium text-gray-900">{{ authStore.admin?.fullName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Rol</p>
            <p class="font-medium text-gray-900">{{ authStore.admin?.role }}</p>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Cambiar contraseña</h2>

        <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-800 text-sm">Contraseña cambiada exitosamente</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              :disabled="loading"
            />
            <p v-if="errors.currentPassword" class="text-red-600 text-sm mt-1">{{ errors.currentPassword }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              :disabled="loading"
            />
            <p v-if="errors.newPassword" class="text-red-600 text-sm mt-1">{{ errors.newPassword }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="text-red-600 text-sm mt-1">{{ errors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>

      <!-- Logout -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Sesión</h2>
        <button
          @click="handleLogout"
          class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  </AdminLayout>
</template>
