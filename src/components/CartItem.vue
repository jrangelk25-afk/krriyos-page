<script setup lang="ts">
import type { CartItem } from '../types'

defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  increment: []
  decrement: []
  remove: []
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

const subtotal = (item: CartItem) => {
  return item.cantidad * item.precioUnitario
}
</script>

<template>
  <div class="flex gap-4 pb-6 border-b border-outline-variant last:border-b-0 hover:bg-surface-bright/50 transition-colors px-2 py-2 rounded-lg">
    <!-- Product Image -->
    <div class="w-24 h-28 flex-shrink-0 bg-surface-product rounded-lg overflow-hidden relative">
      <img 
        :src="item.producto.imagenes[0]"
        :alt="item.producto.nombre"
        class="w-full h-full object-cover"
      />
      
      <!-- Color indicator badge -->
      <div v-if="item.colorName" class="absolute bottom-2 right-2 flex items-center gap-1 bg-on-surface/90 backdrop-blur-sm rounded-full px-2 py-1">
        <div class="w-3 h-3 rounded-full border border-on-primary" :style="{ backgroundColor: item.colorId ? '#CCCCCC' : '#999' }" />
        <span class="text-xs font-label-caps text-on-primary">{{ item.colorName }}</span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex-1 flex flex-col gap-3">
      <!-- Header with remove button -->
      <div class="flex justify-between items-start">
        <div class="space-y-1 flex-1">
          <p class="font-label-caps text-label-caps text-xs text-on-surface-variant uppercase">
            {{ item.producto.sku }}
          </p>
          <h4 class="font-label-lg text-label-lg text-on-surface">
            {{ item.producto.nombre }}
          </h4>
          
          <!-- Size and Color details -->
          <div class="flex items-center gap-3 mt-2">
            <div class="flex items-center gap-1 bg-surface-dim rounded px-2 py-1">
              <span class="material-symbols-outlined text-xs">straight</span>
              <span class="font-label-md text-label-md text-on-surface">Talla {{ item.talla }}</span>
            </div>
            
            <div v-if="item.colorName" class="flex items-center gap-1 bg-surface-dim rounded px-2 py-1">
              <div class="w-3 h-3 rounded-full border border-on-surface-variant" />
              <span class="font-label-md text-label-md text-on-surface">{{ item.colorName }}</span>
            </div>
          </div>
        </div>
        
        <button 
          @click="() => emit('remove')"
          class="text-error hover:bg-error/10 transition-colors p-2 rounded-lg"
          title="Eliminar del carrito"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>

      <!-- Quantity and Price -->
      <div class="flex items-center justify-between mt-auto">
        <div class="flex items-center gap-2 border border-outline-variant rounded-lg p-1 bg-surface-bright">
          <button 
            @click="() => emit('decrement')"
            class="flex items-center justify-center w-8 h-8 hover:bg-surface-container rounded transition-colors"
            title="Disminuir cantidad"
          >
            <span class="material-symbols-outlined text-lg">remove</span>
          </button>
          <span class="w-8 text-center font-label-lg text-label-lg text-on-surface">
            {{ item.cantidad }}
          </span>
          <button 
            @click="() => emit('increment')"
            class="flex items-center justify-center w-8 h-8 hover:bg-surface-container rounded transition-colors"
            title="Aumentar cantidad"
          >
            <span class="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
        
        <div class="text-right">
          <p class="font-label-sm text-label-sm text-on-surface-variant">
            {{ formatCurrency(item.precioUnitario) }} c/u
          </p>
          <p class="font-headline-sm text-headline-sm text-primary mt-1">
            {{ formatCurrency(subtotal(item)) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
:deep(.material-symbols-outlined) {
  transition: transform 0.2s ease;
}

button:active :deep(.material-symbols-outlined) {
  transform: scale(0.95);
}
</style>
