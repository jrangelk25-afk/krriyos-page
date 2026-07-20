<script setup lang="ts">
import type { Product } from '../types'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  // Evento removido - ahora usa navegación directa
}>()

const router = useRouter()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

const goToDetail = () => {
  router.push(`/producto/${props.product.id}`)
}

const handleViewProduct = (e: Event) => {
  e.stopPropagation()
  goToDetail()
}

// Calcular precio con descuento
const precioConDescuento = computed(() => {
  if (props.product.isOutlet && props.product.discountPercentage) {
    const descuento = (props.product.precio * props.product.discountPercentage) / 100
    return props.product.precio - descuento
  }
  return props.product.precio
})

const descuentoAplicado = computed(() => {
  return props.product.isOutlet && props.product.discountPercentage ? props.product.discountPercentage : 0
})
</script>

<template>
  <div 
    @click="goToDetail"
    class="group cursor-pointer product-card"
  >
    <!-- Image Container -->
    <div class="bg-surface-product aspect-[4/5] overflow-hidden mb-4 relative">
      <img 
        :src="product.imagenes[0]"
        :alt="product.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Badges -->
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        <div v-if="product.isNewArrival" class="bg-secondary text-on-secondary text-[10px] font-bold px-3 py-1 rounded-full">
          NUEVO
        </div>
        <div v-if="descuentoAplicado > 0" class="bg-error text-on-error text-[12px] font-bold px-3 py-1 rounded-full">
          -{{ descuentoAplicado }}%
        </div>
        <div v-if="product.stock <= 0" class="bg-on-surface-variant text-surface-variant text-[10px] font-bold px-3 py-1 rounded-full">
          AGOTADO
        </div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex flex-col gap-2">
      <h4 class="font-label-caps text-label-caps uppercase text-on-surface line-clamp-2">
        {{ product.sku }} {{ product.nombre }}
      </h4>
      
      <!-- Prices -->
      <div class="flex items-center gap-2">
        <p v-if="descuentoAplicado > 0" class="font-body-md text-body-md text-on-surface-variant line-through text-sm">
          {{ formatCurrency(product.precio) }}
        </p>
        <p class="font-body-md text-body-md text-on-surface" :class="{ 'text-error font-bold': descuentoAplicado > 0 }">
          {{ formatCurrency(precioConDescuento) }}
        </p>
      </div>

      <p class="font-body-md text-body-md text-on-surface-variant text-sm">
        {{ product.categoria }}
      </p>

      <!-- View Product Button -->
      <button 
        @click="handleViewProduct"
        class="mt-3 w-full bg-primary text-on-primary px-4 py-2 font-label-caps text-label-caps uppercase text-sm hover:opacity-90 transition-opacity"
      >
        Ver
      </button>
    </div>
  </div>
</template>
