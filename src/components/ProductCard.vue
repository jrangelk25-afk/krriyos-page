<script setup lang="ts">
import type { Product } from '../types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  addToCart: [product: Product]
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

const handleAddToCart = (e: Event) => {
  e.stopPropagation()
  emit('addToCart', props.product)
}
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
        <div v-if="product.isOutlet" class="bg-error text-on-error text-[10px] font-bold px-3 py-1 rounded-full">
          OUTLET
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
      <p class="font-body-md text-body-md text-on-surface-variant">
        {{ formatCurrency(product.precio) }}
      </p>
      <p class="font-body-md text-body-md text-on-surface-variant text-sm">
        {{ product.categoria }}
      </p>

      <!-- Add to Cart Button -->
      <button 
        v-if="product.stock > 0"
        @click="handleAddToCart"
        :disabled="product.stock <= 0"
        class="mt-3 w-full bg-primary text-on-primary px-4 py-2 font-label-caps text-label-caps uppercase text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Agregar
      </button>
      <button 
        v-else
        disabled
        class="mt-3 w-full bg-surface-variant text-on-surface-variant px-4 py-2 font-label-caps text-label-caps uppercase text-sm cursor-not-allowed"
      >
        Agotado
      </button>
    </div>
  </div>
</template>
