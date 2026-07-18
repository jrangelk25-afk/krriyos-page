<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(true)

// Verificar autenticación al montar
const checkAuth = () => {
  if (!authStore.checkAuth()) {
    router.push('/admin/login')
  }
}

checkAuth()

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <AdminHeader @toggle-sidebar="toggleSidebar" />
    <div class="flex">
      <AdminSidebar :open="sidebarOpen" @close-sidebar="closeSidebar" />
      <main :class="['flex-1 overflow-auto transition-all duration-300', sidebarOpen ? 'md:ml-64' : 'md:ml-20']">
        <div class="p-4 sm:p-6 md:p-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
