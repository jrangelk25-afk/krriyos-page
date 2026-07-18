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
  <div class="flex gap-1.5 pb-2 border-b border-outline-variant last:border-b-0 hover:bg-surface-bright/50 transition-colors py-1 rounded">
    <!-- Product Image -->
    <div class="w-12 h-14 flex-shrink-0 bg-surface-product rounded overflow-hidden relative">
      <img 
        :src="item.producto.imagenes[0]"
        :alt="item.producto.nombre"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Product Info -->
    <div class="flex-1 flex flex-col gap-0.5 min-w-0">
      <!-- Header with remove button -->
      <div class="flex justify-between items-start gap-1">
        <div class="space-y-0 flex-1 min-w-0">
          <p class="font-label-caps text-label-caps text-xs text-on-surface-variant uppercase truncate">
            {{ item.producto.sku }}
          </p>
          <h4 class="font-label-lg text-label-lg text-on-surface text-xs line-clamp-1">
            {{ item.producto.nombre }}
          </h4>
          
          <!-- Size detail only -->
          <div class="flex items-center gap-0.5 mt-0.5">
            <span class="material-symbols-outlined text-xs">straight</span>
            <span class="font-label-md text-label-md text-on-surface text-xs">{{ item.talla }}</span>
          </div>
        </div>
        
        <button 
          @click="() => emit('remove')"
          class="text-error hover:bg-error/10 transition-colors p-0.5 rounded flex-shrink-0"
          title="Eliminar"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <!-- Quantity and Price -->
      <div class="flex items-center justify-between gap-1 mt-auto">
        <div class="flex items-center gap-0 border border-outline-variant rounded p-0.5 bg-surface-bright flex-shrink-0">
          <button 
            @click="() => emit('decrement')"
            class="flex items-center justify-center w-4 h-4 hover:bg-surface-container rounded transition-colors"
            title="Disminuir"
          >
            <span class="material-symbols-outlined text-xs">remove</span>
          </button>
          <span class="w-4 text-center font-label-lg text-label-lg text-on-surface text-xs">
            {{ item.cantidad }}
          </span>
          <button 
            @click="() => emit('increment')"
            class="flex items-center justify-center w-4 h-4 hover:bg-surface-container rounded transition-colors"
            title="Aumentar"
          >
            <span class="material-symbols-outlined text-xs">add</span>
          </button>
        </div>
        
        <div class="text-right flex-shrink-0">
          <p class="font-headline-sm text-headline-sm text-primary text-xs">
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
