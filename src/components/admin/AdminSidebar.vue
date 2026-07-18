<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'close-sidebar': []
}>()

const router = useRouter()
const route = useRoute()

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const navigate = (path: string) => {
  router.push(path)
}

const menuItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Productos',
    path: '/admin/products',
    icon: 'shopping_bag',
  },
  {
    label: 'Categorías',
    path: '/admin/categories',
    icon: 'category',
  },
  {
    label: 'Órdenes',
    path: '/admin/orders',
    icon: 'receipt',
  },
  {
    label: 'Clientes',
    path: '/admin/customers',
    icon: 'people',
  },
  {
    label: 'Usuarios Admin',
    path: '/admin/users',
    icon: 'admin_panel_settings',
  },
  {
    label: 'Auditoría',
    path: '/admin/audit-logs',
    icon: 'history',
  },
]
</script>

<template>
  <!-- Overlay para cerrar sidebar en mobile -->
  <div 
    v-if="open"
    class="fixed inset-0 bg-black/50 z-10 md:hidden"
    @click="$emit('close-sidebar')"
  />
  
  <aside
    :class="[
      'fixed left-0 top-20 h-[calc(100vh-80px)] bg-gradient-to-b from-gray-900 to-gray-950 text-white transition-all duration-300 z-20 overflow-y-auto',
      open ? 'w-64' : 'md:w-20 w-0',
      'md:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <nav class="p-2 md:p-4 space-y-1 md:space-y-2">
      <div
        v-for="item in menuItems"
        :key="item.path"
        @click="navigate(item.path)"
        :class="[
          'flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap md:whitespace-normal',
          isActive(item.path)
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white',
        ]"
      >
        <span class="material-symbols-outlined text-lg md:text-xl flex-shrink-0">{{ item.icon }}</span>
        <span v-if="open" class="font-medium text-sm md:text-sm">{{ item.label }}</span>
      </div>
    </nav>

    <!-- Footer info -->
    <div v-if="open" class="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-gray-700 bg-gray-950/50">
      <p class="text-xs text-gray-400 text-center">Krriyos v1.0</p>
    </div>
  </aside>
</template>
