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

const subtotal = (item: CartItem) => {
  return (item.cantidad * item.precioUnitario).toFixed(2)
}
</script>

<template>
  <div class="flex gap-4 pb-4 border-b border-outline-variant last:border-b-0">
    <!-- Product Image -->
    <div class="w-20 h-24 flex-shrink-0 bg-surface-product rounded-lg overflow-hidden">
      <img 
        :src="item.producto.imagenes[0]"
        :alt="item.producto.nombre"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Product Info -->
    <div class="flex-1 flex flex-col gap-2">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-label-caps text-label-caps text-sm text-on-surface">
            {{ item.producto.sku }}
          </h4>
          <p class="font-body-md text-body-md text-on-surface">
            {{ item.producto.nombre }}
          </p>
          <p class="font-body-md text-body-md text-on-surface-variant text-sm">
            Talla: {{ item.talla }}
          </p>
        </div>
        <button 
          @click="() => emit('remove')"
          class="text-error hover:opacity-70 transition-opacity"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Quantity and Price -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 border border-outline-variant rounded-lg p-1">
          <button 
            @click="() => emit('decrement')"
            class="p-1 hover:bg-surface-container rounded"
            title="Disminuir cantidad"
          >
            <span class="material-symbols-outlined text-lg">remove</span>
          </button>
          <span class="w-8 text-center font-body-md text-body-md">
            {{ item.cantidad }}
          </span>
          <button 
            @click="() => emit('increment')"
            class="p-1 hover:bg-surface-container rounded"
            title="Aumentar cantidad"
          >
            <span class="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
        <p class="font-label-caps text-label-caps text-on-surface">
          ${{ subtotal(item) }}
        </p>
      </div>
    </div>
  </div>
</template>
