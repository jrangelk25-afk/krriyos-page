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
    <div class="px-4 sm:px-6 md:px-8 py-3 md:py-4 flex justify-between items-center gap-4">
      <div class="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          @click="emit('toggle-sidebar')"
          class="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <span class="material-symbols-outlined text-xl md:text-2xl">menu</span>
        </button>
        <div class="flex items-center gap-2 md:gap-3 min-w-0">
          <img src="/logo.webp" alt="Krriyos" class="h-6 md:h-8 object-contain flex-shrink-0" />
          <h1 class="font-bold text-lg md:text-xl text-gray-900 truncate">Admin</h1>
        </div>
      </div>

      <div class="flex items-center gap-3 md:gap-6">
        <div class="text-right hidden sm:block">
          <p class="text-xs md:text-sm font-medium text-gray-900 truncate">{{ authStore.admin?.email }}</p>
          <p class="text-xs text-gray-600 hidden md:block">{{ authStore.admin?.role }}</p>
        </div>
        
        <div class="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button
            @click="goToSettings"
            class="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Settings"
            title="Configuración"
          >
            <span class="material-symbols-outlined text-lg md:text-xl">settings</span>
          </button>

          <button
            @click="handleLogout"
            class="p-1 md:p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
            aria-label="Logout"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-lg md:text-xl">logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
