<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  src: string
  alt: string
  srcset?: string
  sizes?: string
  width?: string | number
  height?: string | number
  class?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  objectFit: 'cover',
})

const isLoaded = ref(false)
const isInView = ref(false)
const imageElement = ref<HTMLImageElement | null>(null)

onMounted(() => {
  if (!imageElement.value) return

  // Use IntersectionObserver for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          observer.unobserve(imageElement.value!)
        }
      })
    },
    {
      rootMargin: '50px',
    }
  )

  observer.observe(imageElement.value)
})

const handleImageLoad = () => {
  isLoaded.value = true
}

const handleImageError = () => {
  console.error(`Failed to load image: ${props.src}`)
  isLoaded.value = true
}

const computedWidth = computed(() => {
  if (!props.width) return undefined
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

const computedHeight = computed(() => {
  if (!props.height) return undefined
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

import { computed } from 'vue'
</script>

<template>
  <div class="lazy-image-wrapper" :style="{ width: computedWidth, height: computedHeight }">
    <!-- Placeholder/skeleton -->
    <div v-show="!isLoaded" class="skeleton-placeholder animate-pulse bg-surface-variant absolute inset-0" />

    <!-- Actual image - only loads when in view -->
    <img
      v-show="isLoaded"
      ref="imageElement"
      v-bind="$attrs"
      :src="isInView ? src : undefined"
      :srcset="isInView ? srcset : undefined"
      :sizes="sizes"
      :alt="alt"
      :class="[
        'lazy-image transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        props.class,
      ]"
      :style="{
        objectFit: objectFit,
        width: '100%',
        height: '100%',
      }"
      @load="handleImageLoad"
      @error="handleImageError"
    />
  </div>
</template>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: var(--color-surface-variant);
}

.skeleton-placeholder {
  z-index: 1;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.lazy-image {
  position: relative;
  z-index: 2;
  display: block;
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
