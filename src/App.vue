<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import { useUIStore } from './stores/uiStore'

const uiStore = useUIStore()
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col bg-background text-on-surface">
    <Header />
    
    <main class="flex-1 pt-[80px]">
      <RouterView />
    </main>

    <Footer />

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
