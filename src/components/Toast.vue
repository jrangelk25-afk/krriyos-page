<script setup lang="ts">
import type { UINotification } from '../types'

defineProps<{
  notification: UINotification
}>()

const emit = defineEmits<{
  close: []
}>()

import { ref } from 'vue'
const isClosing = ref(false)

const close = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 300)
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'info':
      return 'info'
    default:
      return 'notifications'
  }
}

const getColorClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'error':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}
</script>

<template>
  <div 
    :class="[
      'toast flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm transition-all duration-300',
      getColorClasses(notification.type),
      isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    ]"
  >
    <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">
      {{ getIcon(notification.type) }}
    </span>
    <p class="font-body-md text-body-md flex-1">
      {{ notification.message }}
    </p>
    <button 
      @click="close"
      class="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>
</template>
