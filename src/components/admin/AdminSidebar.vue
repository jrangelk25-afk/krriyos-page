<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

defineProps<{
  open: boolean
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
  <aside
    :class="[
      'fixed left-0 top-20 h-[calc(100vh-80px)] bg-gradient-to-b from-gray-900 to-gray-950 text-white transition-all duration-300 z-20 overflow-y-auto',
      open ? 'w-64' : 'w-20',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <nav class="p-4 space-y-2">
      <div
        v-for="item in menuItems"
        :key="item.path"
        @click="navigate(item.path)"
        :class="[
          'flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200',
          isActive(item.path)
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white',
        ]"
      >
        <span class="material-symbols-outlined text-xl flex-shrink-0">{{ item.icon }}</span>
        <span v-if="open" class="font-medium text-sm">{{ item.label }}</span>
      </div>
    </nav>

    <!-- Footer info -->
    <div v-if="open" class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-950/50">
      <p class="text-xs text-gray-400 text-center">Krriyos Admin v1.0</p>
    </div>
  </aside>
</template>
