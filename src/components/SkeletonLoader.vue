<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'card' | 'line' | 'text' | 'image' | 'full-card'
  count?: number
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 1,
  width: '100%',
  height: 'auto',
})

const skeletons = computed(() => Array(props.count).fill(0))
</script>

<template>
  <!-- Product Card Skeleton -->
  <template v-if="type === 'card' || type === 'full-card'">
    <div v-for="i in skeletons" :key="i" class="skeleton-card">
      <!-- Image placeholder -->
      <div class="skeleton-image animate-pulse bg-surface-variant rounded-lg mb-4 aspect-square" />

      <!-- Content placeholder -->
      <div class="space-y-3">
        <!-- Product name -->
        <div class="skeleton-line animate-pulse bg-surface-variant rounded h-4 w-3/4" />

        <!-- Price -->
        <div class="skeleton-line animate-pulse bg-surface-variant rounded h-5 w-1/2" />

        <!-- Button -->
        <div class="skeleton-line animate-pulse bg-surface-variant rounded h-10 w-full mt-4" />
      </div>
    </div>
  </template>

  <!-- Single Line Skeleton -->
  <template v-else-if="type === 'line'">
    <div v-for="i in skeletons" :key="i" class="animate-pulse bg-surface-variant rounded mb-3" :style="{ height, width }" />
  </template>

  <!-- Text Block Skeleton -->
  <template v-else-if="type === 'text'">
    <div v-for="i in skeletons" :key="i" class="space-y-3">
      <div class="animate-pulse bg-surface-variant rounded h-4 w-full" />
      <div class="animate-pulse bg-surface-variant rounded h-4 w-5/6" />
      <div class="animate-pulse bg-surface-variant rounded h-4 w-4/6" />
    </div>
  </template>

  <!-- Image Skeleton -->
  <template v-else-if="type === 'image'">
    <div v-for="i in skeletons" :key="i" class="animate-pulse bg-surface-variant rounded-lg" :style="{ height, width }" />
  </template>
</template>

<style scoped>
.skeleton-card {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-image {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-line {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
