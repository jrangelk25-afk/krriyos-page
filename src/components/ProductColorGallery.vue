<template>
  <div class="space-y-6">
    <!-- Colors Title -->
    <div class="space-y-2">
      <h3 class="font-headline-md text-headline-md text-on-surface uppercase">
        Colores Disponibles
      </h3>
      <p class="font-body-md text-body-md text-on-surface-variant">
        Selecciona un color para ver las imágenes correspondientes
      </p>
    </div>

    <!-- Colors Grid -->
    <div v-if="colors.length > 0" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <button
        v-for="color in colors"
        :key="color.id"
        @click="selectColor(color)"
        :class="[
          'group relative overflow-hidden rounded-lg transition-all duration-200 aspect-square',
          selectedColor?.id === color.id
            ? 'ring-4 ring-primary ring-offset-2 shadow-lg'
            : 'hover:ring-2 hover:ring-primary hover:ring-offset-1 shadow'
        ]"
        :title="`${color.name} (${color.hexCode})`"
      >
        <!-- Color preview -->
        <div
          class="w-full h-full rounded-lg border-4 border-outline transition-all group-hover:scale-105"
          :style="{ backgroundColor: color.hexCode || '#CCCCCC' }"
        />

        <!-- Color name overlay on hover -->
        <div
          :class="[
            'absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/40 transition-colors duration-200 flex items-end justify-center p-2',
            selectedColor?.id === color.id ? 'bg-ink-black/30' : ''
          ]"
        >
          <span class="font-label-sm text-label-sm text-on-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {{ color.name }}
          </span>
        </div>

        <!-- Selection indicator -->
        <div v-if="selectedColor?.id === color.id" class="absolute top-2 right-2">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary shadow-lg animate-pulse">
            <span class="material-symbols-outlined text-lg">check</span>
          </div>
        </div>
      </button>
    </div>

    <!-- No colors message -->
    <div v-else class="text-center py-8 text-on-surface-variant">
      <p class="font-body-md">No hay colores disponibles para este producto</p>
    </div>

    <!-- Selected Color Details -->
    <div v-if="selectedColor" class="bg-surface-bright border-2 border-primary rounded-lg p-6 animate-in fade-in">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Color preview and info -->
        <div class="flex items-center gap-4">
          <div
            class="w-24 h-24 rounded-lg border-4 border-primary shadow-md"
            :style="{ backgroundColor: selectedColor.hexCode }"
          />
          <div class="space-y-2">
            <p class="font-label-md text-label-md text-on-surface-variant uppercase">Color Seleccionado</p>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ selectedColor.name }}</h4>
            <p class="font-label-caps text-label-caps text-on-surface-variant">{{ selectedColor.hexCode }}</p>
          </div>
        </div>

        <!-- Available sizes for this color -->
        <div class="space-y-3">
          <p class="font-label-md text-label-md text-on-surface-variant uppercase">Tallas disponibles</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="size in availableSizesForColor"
              :key="size"
              class="bg-primary/10 text-primary font-label-md text-label-md px-3 py-1 rounded-full"
            >
              {{ size }}
            </span>
          </div>
          <p v-if="availableSizesForColor.length === 0" class="text-on-surface-variant text-sm">
            No hay tallas disponibles en este color
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Color {
  id: string
  name: string
  hexCode: string
}

interface Props {
  colors: Color[]
  sizes?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  sizes: () => [],
})

const emit = defineEmits<{
  colorSelected: [color: Color]
}>()

const selectedColor = ref<Color | null>(null)

const availableSizesForColor = computed(() => {
  if (!selectedColor.value || !props.sizes) return []

  const sizesForColor = new Set<string>()
  
  props.sizes.forEach((size: any) => {
    if (size.availableColors?.some((c: any) => c.id === selectedColor.value?.id)) {
      sizesForColor.add(size.size)
    }
  })

  return Array.from(sizesForColor)
})

function selectColor(color: Color) {
  selectedColor.value = color
  emit('colorSelected', color)
}

// Select first color by default
if (props.colors.length > 0 && !selectedColor.value) {
  selectColor(props.colors[0])
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeIn 0.3s ease-out;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
