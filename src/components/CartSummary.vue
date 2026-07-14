<script setup lang="ts">
import type { CartItem } from '../types'

const props = defineProps<{
  items: CartItem[]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

const subtotal = () => {
  return props.items.reduce((acc: number, item: CartItem) => acc + (item.cantidad * item.precioUnitario), 0)
}

const tax = () => {
  return subtotal() * 0.19
}

const total = () => {
  return subtotal() + tax()
}

const itemCount = () => {
  return props.items.reduce((acc: number, item: CartItem) => acc + item.cantidad, 0)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Items Summary -->
    <div class="bg-surface-bright rounded-lg p-4 border border-outline-variant">
      <div class="flex justify-between items-center mb-2">
        <p class="font-label-md text-label-md text-on-surface-variant uppercase">
          {{ itemCount() }} Artículo{{ itemCount() !== 1 ? 's' : '' }}
        </p>
        <p class="font-label-md text-label-md text-on-surface">
          {{ formatCurrency(subtotal()) }}
        </p>
      </div>
    </div>

    <!-- Breakdown -->
    <div class="space-y-3 p-4 border border-outline-variant rounded-lg">
      <!-- Subtotal -->
      <div class="flex justify-between items-center">
        <p class="font-body-md text-body-md text-on-surface-variant">
          Subtotal
        </p>
        <p class="font-label-caps text-label-caps text-on-surface">
          {{ formatCurrency(subtotal()) }}
        </p>
      </div>

      <!-- Tax -->
      <div class="flex justify-between items-center">
        <p class="font-body-md text-body-md text-on-surface-variant">
          Impuesto (19%)
        </p>
        <p class="font-label-caps text-label-caps text-on-surface">
          {{ formatCurrency(tax()) }}
        </p>
      </div>

      <!-- Separator -->
      <div class="h-px bg-outline-variant"></div>

      <!-- Total -->
      <div class="flex justify-between items-center">
        <p class="font-headline-md text-headline-md text-on-surface">
          Total
        </p>
        <p class="font-headline-lg text-headline-lg text-primary">
          {{ formatCurrency(total()) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
