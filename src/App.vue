<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import FloatingButton from './components/FloatingButton.vue'
import { useUIStore } from './stores/uiStore'

const uiStore = useUIStore()
const route = useRoute()

// Determinar si mostrar header y footer (reactivo)
const showHeaderFooter = computed(() => !route.path.startsWith('/admin'))
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col bg-background text-on-surface">
    <Header v-if="showHeaderFooter" />
    
    <main :class="['flex-1', showHeaderFooter ? 'pt-[80px]' : '']">
      <RouterView />
    </main>

    <Footer v-if="showHeaderFooter" />

    <!-- Floating Social Button -->
    <FloatingButton v-if="showHeaderFooter" />

    <!-- Toast Container -->
    <div class="fixed top-8 right-8 z-50 space-y-3 md:top-8 md:right-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0">
      <Toast 
        v-for="notification in uiStore.notifications"
        :key="notification.id"
        :notification="notification"
        @close="uiStore.removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
