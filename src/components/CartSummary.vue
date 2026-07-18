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

const total = () => {
  return subtotal()
}

const itemCount = () => {
  return props.items.reduce((acc: number, item: CartItem) => acc + item.cantidad, 0)
}
</script>

<template>
  <div class="space-y-1 sm:space-y-2">
    <!-- Items Summary -->
    <div class="bg-surface-bright rounded-lg p-1.5 sm:p-3 border border-outline-variant">
      <div class="flex justify-between items-center gap-2">
        <p class="font-label-md text-label-md text-on-surface-variant uppercase text-xs">
          {{ itemCount() }} Art.
        </p>
        <p class="font-label-md text-label-md text-on-surface text-xs">
          {{ formatCurrency(subtotal()) }}
        </p>
      </div>
    </div>

    <!-- Breakdown -->
    <div class="space-y-1 p-1.5 sm:p-3 border border-outline-variant rounded-lg">
      <!-- Subtotal -->
      <div class="flex justify-between items-center gap-2">
        <p class="font-body-md text-body-md text-on-surface-variant text-xs">
          Subtotal
        </p>
        <p class="font-label-caps text-label-caps text-on-surface text-xs">
          {{ formatCurrency(subtotal()) }}
        </p>
      </div>

      <!-- Separator -->
      <div class="h-px bg-outline-variant"></div>

      <!-- Total -->
      <div class="flex justify-between items-center gap-2">
        <p class="font-headline-md text-headline-md text-on-surface text-sm">
          Total
        </p>
        <p class="font-headline-lg text-headline-lg text-primary text-sm">
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
