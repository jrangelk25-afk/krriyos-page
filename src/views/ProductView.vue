<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const products = useProducts()
const cart = useCart()

const product = ref(products.getById(route.params.id as string))
const selectedTalla = ref<string>('')
const quantity = ref(1)
const currentImageIndex = ref(0)

if (!product.value) {
  router.push('/catalogo')
}

const handleAddToCart = () => {
  if (!selectedTalla.value) {
    alert('Por favor selecciona una talla')
    return
  }
  cart.addToCart(product.value!, quantity.value, selectedTalla.value)
  quantity.value = 1
  selectedTalla.value = ''
}

const goBack = () => {
  router.push('/catalogo')
}

const nextImage = () => {
  if (product.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.imagenes.length
  }
}

const prevImage = () => {
  if (product.value) {
    currentImageIndex.value = (currentImageIndex.value - 1 + product.value.imagenes.length) % product.value.imagenes.length
  }
}
</script>

<template>
  <div v-if="product" class="min-h-[calc(100vh-80px)]">
    <div class="px-margin-mobile md:px-margin-desktop py-12 max-w-7xl mx-auto">
      <!-- Back Button -->
      <button 
        @click="goBack"
        class="font-label-caps text-label-caps text-primary uppercase hover:opacity-70 transition-opacity mb-8"
      >
        ← Volver al Catálogo
      </button>

      <!-- Product Detail -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Image Gallery -->
        <div class="flex flex-col gap-4">
          <!-- Main Image -->
          <div class="aspect-[4/5] bg-surface-product rounded-lg overflow-hidden relative">
            <img 
              :src="product.imagenes[currentImageIndex]"
              :alt="product.nombre"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-between px-4 py-4">
              <button 
                v-if="product.imagenes.length > 1"
                @click="prevImage"
                class="bg-ink-black/50 text-on-primary hover:bg-ink-black/70 transition-colors p-2 rounded-full"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                v-if="product.imagenes.length > 1"
                @click="nextImage"
                class="bg-ink-black/50 text-on-primary hover:bg-ink-black/70 transition-colors p-2 rounded-full"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="product.imagenes.length > 1" class="flex gap-2">
            <button 
              v-for="(img, index) in product.imagenes"
              :key="index"
              @click="currentImageIndex = index"
              :class="[
                'w-20 h-24 rounded-lg overflow-hidden border-2',
                index === currentImageIndex ? 'border-primary' : 'border-outline-variant'
              ]"
            >
              <img 
                :src="img"
                :alt="`Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col gap-6">
          <!-- SKU and Name -->
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">
              {{ product.sku }}
            </p>
            <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface uppercase">
              {{ product.nombre }}
            </h1>
          </div>

          <!-- Description -->
          <p class="font-body-lg text-body-lg text-on-surface-variant">
            {{ product.descripcion }}
          </p>

          <!-- Price -->
          <div class="text-4xl font-bold text-primary">
            ${{ product.precio.toFixed(2) }}
          </div>

          <!-- Category and Stock -->
          <div class="flex gap-8">
            <div>
              <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Categoría</p>
              <p class="font-body-md text-body-md text-on-surface">{{ product.categoria }}</p>
            </div>
            <div>
              <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Stock</p>
              <p :class="['font-body-md text-body-md', product.stock > 0 ? 'text-green-600' : 'text-error']">
                {{ product.stock > 0 ? `${product.stock} disponibles` : 'Agotado' }}
              </p>
            </div>
          </div>

          <!-- Talla Selection -->
          <div v-if="product.stock > 0">
            <label class="font-label-caps text-label-caps text-on-surface uppercase block mb-3">
              Selecciona una Talla
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="talla in product.tallas"
                :key="talla"
                @click="selectedTalla = talla"
                :class="[
                  'p-3 border-2 rounded-lg font-label-caps text-label-caps text-center transition-colors',
                  selectedTalla === talla 
                    ? 'border-primary bg-primary text-on-primary' 
                    : 'border-outline-variant text-on-surface hover:border-primary'
                ]"
              >
                {{ talla }}
              </button>
            </div>
          </div>

          <!-- Quantity Selection -->
          <div v-if="product.stock > 0" class="flex items-center gap-4">
            <label class="font-label-caps text-label-caps text-on-surface uppercase">Cantidad</label>
            <div class="flex items-center border border-outline-variant rounded-lg">
              <button 
                @click="quantity = Math.max(1, quantity - 1)"
                class="p-2 hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined">remove</span>
              </button>
              <span class="w-12 text-center font-body-md">{{ quantity }}</span>
              <button 
                @click="quantity = Math.min(product.stock, quantity + 1)"
                class="p-2 hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <button 
            v-if="product.stock > 0"
            @click="handleAddToCart"
            :disabled="!selectedTalla"
            class="w-full bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar al Carrito
          </button>
          <button 
            v-else
            disabled
            class="w-full bg-surface-variant text-on-surface-variant px-8 py-4 font-label-caps text-label-caps uppercase cursor-not-allowed"
          >
            Agotado
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-[calc(100vh-80px)] flex items-center justify-center">
    <p class="font-body-lg text-body-lg text-on-surface-variant">
      Producto no encontrado
    </p>
  </div>
</template>
