<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: '',
})

const errors = reactive<{ email?: string; password?: string }>({})

const validateForm = () => {
  errors.email = undefined
  errors.password = undefined

  if (!formData.email) {
    errors.email = 'El email es requerido'
  } else if (!formData.email.includes('@')) {
    errors.email = 'Email inválido'
  }

  if (!formData.password) {
    errors.password = 'La contraseña es requerida'
  } else if (formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await authStore.login(formData.email, formData.password)
    router.push('/admin/dashboard')
  } catch (error) {
    // Login failed
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-2xl p-8">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/logo.webp" alt="Krriyos" class="h-12 object-contain" />
        </div>

        <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">
          Panel Admin
        </h1>
        <p class="text-gray-600 text-center mb-8">Ingresa tus credenciales</p>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              v-model="formData.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg font-body-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="admin@ejemplo.com"
              :disabled="authStore.isLoading"
            />
            <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              v-model="formData.password"
              type="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg font-body-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
              :disabled="authStore.isLoading"
            />
            <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700 text-sm">{{ authStore.error }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading || !formData.email || !formData.password"
            class="w-full bg-blue-600 text-white px-8 py-3 font-medium rounded-lg uppercase hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="authStore.isLoading" class="material-symbols-outlined animate-spin text-lg">
              loading
            </span>
            {{ authStore.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
