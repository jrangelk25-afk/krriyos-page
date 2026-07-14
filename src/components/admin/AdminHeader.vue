<script setup lang="ts">
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const emit = defineEmits(['toggle-sidebar'])

const handleLogout = () => {
  authStore.logout()
  router.push('/admin/login')
}

const goToSettings = () => {
  router.push('/admin/settings')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-md">
    <div class="px-8 py-4 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button
          @click="emit('toggle-sidebar')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          aria-label="Toggle sidebar"
        >
        </button>
        <div class="flex items-center gap-3">
          <img src="/logo.webp" alt="Krriyos" class="h-8 object-contain" />
          <h1 class="font-bold text-xl text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-900">{{ authStore.admin?.email }}</p>
          <p class="text-xs text-gray-600">{{ authStore.admin?.role }}</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="goToSettings"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Settings"
            title="Configuración"
          >
            <span class="material-symbols-outlined">settings</span>
          </button>

          <button
            @click="handleLogout"
            class="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
            aria-label="Logout"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
