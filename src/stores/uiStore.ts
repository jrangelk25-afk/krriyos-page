import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UINotification } from '../types'

export const useUIStore = defineStore('ui', () => {
  const notifications = ref<UINotification[]>([])
  const isLoading = ref(false)

  const hasNotifications = computed(() => notifications.value.length > 0)

  // Actions
  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now().toString()
    const notification: UINotification = {
      id,
      message,
      type,
      duration,
    }

    notifications.value.push(notification)

    // Auto-dismiss
    setTimeout(() => {
      removeNotification(id)
    }, duration)

    return id
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    notifications,
    isLoading,
    hasNotifications,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading,
  }
})
