<script setup lang="ts">
import type { CartItem } from '../types'

const props = defineProps<{
  items: CartItem[]
}>()

const subtotal = () => {
  const sum = props.items.reduce((acc: number, item: CartItem) => acc + (item.cantidad * item.precioUnitario), 0)
  return sum.toFixed(2)
}

const tax = () => {
  const taxAmount = parseFloat(subtotal()) * 0.19
  return taxAmount.toFixed(2)
}

const total = () => {
  const totalAmount = parseFloat(subtotal()) + parseFloat(tax())
  return totalAmount.toFixed(2)
}
</script>

<template>
  <div class="border-t border-outline-variant pt-4 mt-4">
    <!-- Subtotal -->
    <div class="flex justify-between items-center mb-3">
      <p class="font-body-md text-body-md text-on-surface-variant">
        Subtotal
      </p>
      <p class="font-label-caps text-label-caps text-on-surface">
        ${{ subtotal() }}
      </p>
    </div>

    <!-- Tax -->
    <div class="flex justify-between items-center mb-4">
      <p class="font-body-md text-body-md text-on-surface-variant">
        Impuesto (19%)
      </p>
      <p class="font-label-caps text-label-caps text-on-surface">
        ${{ tax() }}
      </p>
    </div>

    <!-- Total -->
    <div class="flex justify-between items-center bg-surface-container p-3 rounded-lg">
      <p class="font-headline-md text-headline-md text-on-surface">
        Total
      </p>
      <p class="font-headline-md text-headline-md text-primary">
        ${{ total() }}
      </p>
    </div>
  </div>
</template>
