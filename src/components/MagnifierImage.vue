<script setup lang="ts">
import { useMagnifier } from '../composables/useMagnifier'

interface Props {
  src: string
  alt: string
  zoomLevel?: number
  containerClass?: string
  magnifierSize?: number
  showCrosshair?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  zoomLevel: 2.5,
  magnifierSize: 100,
  showCrosshair: true,
  containerClass: 'w-full h-full'
})

const {
  showMagnifier,
  handleMouseMove,
  handleMouseEnter,
  handleMouseLeave,
  magnifierStyle,
  zoomedImageStyle
} = useMagnifier(props.zoomLevel)
</script>

<template>
  <div 
    :class="[props.containerClass, 'relative overflow-hidden']"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <img 
      :src="props.src"
      :alt="props.alt"
      class="w-full h-full object-cover"
    />
    
    <!-- Magnifier Glass -->
    <div 
      v-if="showMagnifier"
      class="magnifier-glass absolute pointer-events-none rounded-full border-2 border-primary/70 overflow-hidden shadow-lg"
      :style="[
        magnifierStyle,
        {
          width: props.magnifierSize + 'px',
          height: props.magnifierSize + 'px'
        }
      ]"
    >
      <img 
        :src="props.src"
        :alt="props.alt"
        class="w-full h-full object-cover"
        :style="zoomedImageStyle"
      />
      
      <!-- Crosshair center -->
      <div v-if="props.showCrosshair" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-0.5 h-6 bg-primary/50"></div>
        <div class="w-6 h-0.5 bg-primary/50 absolute"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.magnifier-glass {
  animation: magnifierPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.4),
    inset 0 0 10px rgba(255, 255, 255, 0.1),
    0 0 0 2px rgba(59, 130, 246, 0.5);
}

@keyframes magnifierPop {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
