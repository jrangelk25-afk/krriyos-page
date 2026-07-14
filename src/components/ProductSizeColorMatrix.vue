<template>
  <div class="space-y-4">
    <!-- Tallas -->
    <div class="space-y-2">
      <label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Talla</label>
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="s in uniqueSizes"
          :key="s"
          @click="selectedSize = s"
          :disabled="!getSizesAvailable().includes(s)"
          :class="[
            'px-3 py-2 rounded font-label-sm text-label-sm uppercase transition-all text-xs',
            selectedSize === s
              ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-1'
              : getSizesAvailable().includes(s)
              ? 'bg-surface-variant text-on-surface-variant border border-outline hover:bg-primary hover:text-on-primary'
              : 'bg-surface-dim text-on-surface-variant cursor-not-allowed opacity-40 border border-outline'
          ]"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Colores por Talla -->
    <div v-if="selectedSize" class="space-y-2 animate-in fade-in">
      <label class="font-label-sm text-label-sm text-on-surface-variant uppercase">
        Colores para {{ selectedSize }}
      </label>
      
      <div v-if="colorsForSelectedSize.length > 0" class="flex gap-3 flex-wrap">
        <button
          v-for="color in colorsForSelectedSize"
          :key="color.id"
          @click="selectColorSize(selectedSize, color)"
          :class="[
            'group relative overflow-hidden rounded-full transition-all',
            isColorSizeSelected(selectedSize, color.id)
              ? 'ring-2 ring-primary ring-offset-2 w-8 h-8'
              : 'w-7 h-7 hover:ring-2 hover:ring-primary hover:ring-offset-1'
          ]"
          :title="`${color.name}`"
        >
          <div
            class="w-full h-full rounded-full transition-transform group-hover:scale-110"
            :style="{ backgroundColor: color.hexCode || '#CCCCCC' }"
          />
          <div v-if="isColorSizeSelected(selectedSize, color.id)" class="absolute inset-0 flex items-center justify-center">
            <div class="flex items-center justify-center w-3 h-3 rounded-full bg-primary text-on-primary">
              <span class="material-symbols-outlined text-xs" style="font-size: 10px;">check</span>
            </div>
          </div>
        </button>
      </div>

      <div v-else class="text-xs text-on-surface-variant py-2">
        Sin colores disponibles para esta talla
      </div>
    </div>

    <!-- Cantidad -->
    <div v-if="selectedColorSize" class="space-y-2 animate-in fade-in">
      <label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Cantidad</label>
      <div class="flex items-center gap-2 bg-surface rounded border border-outline p-2">
        <button
          @click="quantity = Math.max(1, quantity - 1)"
          :disabled="quantity === 1"
          class="flex items-center justify-center w-7 h-7 rounded border border-outline hover:bg-surface-variant disabled:opacity-30 text-xs"
        >
          −
        </button>
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          class="flex-1 text-center font-label-md text-xs bg-transparent border-0"
        />
        <button
          @click="quantity = quantity + 1"
          class="flex items-center justify-center w-7 h-7 rounded border border-outline hover:bg-surface-variant text-xs"
        >
          +
        </button>
      </div>
    </div>

    <!-- Summary Mini -->
    <div v-if="selectedColorSize" class="bg-surface rounded p-2 border border-outline-variant animate-in fade-in text-xs">
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded-full border border-primary flex-shrink-0"
          :style="{ backgroundColor: selectedColorSize.color.hexCode }"
        />
        <div class="flex-1 min-w-0">
          <p class="font-label-sm text-on-surface truncate">
            {{ quantity }}x {{ productName }}
          </p>
          <p class="font-body-xs text-on-surface-variant">
            {{ selectedColorSize.size }} - {{ selectedColorSize.color.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add to Cart Button -->
    <button
      @click="handleAddToCart"
      :disabled="!selectedColorSize"
      :class="[
        'w-full py-2 rounded font-label-sm uppercase transition-all text-sm',
        selectedColorSize
          ? 'bg-primary text-on-primary hover:shadow-lg active:scale-95'
          : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
      ]"
    >
      {{ selectedColorSize ? 'Agregar' : 'Selecciona' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Color {
  id: string
  name: string
  hexCode: string
}

interface SizeColor {
  size: string
  color: Color
}

interface SizeWithColors {
  size: string
  availableColors: Color[]
}

interface Props {
  productId: string
  productName: string
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  addToCart: [details: { size: string; colorId: string; colorName: string; quantity: number }]
}>()

const selectedSize = ref<string | null>(null)
const selectedColorSize = ref<SizeColor | null>(null)
const quantity = ref(1)
const sizesWithColors = ref<SizeWithColors[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '38', '39', '40', '41', '42', '43', '44', '45']

const uniqueSizes = computed(() => {
  return sizesWithColors.value
    .map(s => s.size)
    .sort((a, b) => {
      const indexA = sizeOrder.indexOf(a)
      const indexB = sizeOrder.indexOf(b)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })
})

const colorsForSelectedSize = computed(() => {
  if (!selectedSize.value) return []
  
  const sizeData = sizesWithColors.value.find(s => s.size === selectedSize.value)
  return sizeData?.availableColors || []
})

function getSizesAvailable(): string[] {
  // Mostrar solo tallas que tienen al menos 1 color disponible
  return sizesWithColors.value
    .filter(s => s.availableColors.length > 0)
    .map(s => s.size)
    .sort((a, b) => {
      const indexA = sizeOrder.indexOf(a)
      const indexB = sizeOrder.indexOf(b)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })
}

function isColorSizeSelected(size: string, colorId: string): boolean {
  return selectedColorSize.value?.size === size && selectedColorSize.value?.color.id === colorId
}

function selectColorSize(size: string, color: Color) {
  selectedColorSize.value = { size, color }
  quantity.value = 1
}

async function initializeMatrix() {
  try {
    isLoading.value = true
    errorMessage.value = null

    const response = await fetch(`/api/public/products/${props.productId}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    const product = result.data || result

    console.log('📦 Producto cargado:', {
      id: product.id,
      name: product.name,
      sizes: product.sizes?.length || 0,
    })

    if (!product.sizes || product.sizes.length === 0) {
      throw new Error('El producto no tiene tallas disponibles')
    }

    // Construir lista de tallas con sus colores específicos
    const sizes: SizeWithColors[] = product.sizes.map((size: any) => {
      // Usar availableColors si existen, si no usar todos los colores del producto
      let colors = size.availableColors || []
      
      if (colors.length === 0 && product.colors && product.colors.length > 0) {
        colors = product.colors
      }

      return {
        size: size.size,
        availableColors: colors.map((color: any) => ({
          id: color.id,
          name: color.name,
          hexCode: color.hexCode || '#CCCCCC'
        }))
      }
    })

    console.log('✨ Tallas con colores:', sizes)

    if (sizes.length === 0 || sizes.every(s => s.availableColors.length === 0)) {
      throw new Error('No hay combinaciones de talla y color disponibles')
    }

    sizesWithColors.value = sizes
    
    // Seleccionar primer tamaño con colores disponibles
    const firstAvailableSize = getSizesAvailable()[0]
    if (firstAvailableSize) {
      selectedSize.value = firstAvailableSize
    }
  } catch (error) {
    console.error('❌ Error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Error al cargar opciones'
  } finally {
    isLoading.value = false
  }
}

function handleAddToCart() {
  if (!selectedColorSize.value) return

  emit('addToCart', {
    size: selectedColorSize.value.size,
    colorId: selectedColorSize.value.color.id,
    colorName: selectedColorSize.value.color.name,
    quantity: quantity.value
  })

  const firstAvailableSize = getSizesAvailable()[0]
  selectedSize.value = firstAvailableSize || null
  selectedColorSize.value = null
  quantity.value = 1
}

onMounted(() => {
  initializeMatrix()
})
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
  animation: fadeIn 0.2s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}
</style>
