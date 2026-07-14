<script setup lang="ts">
import { onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'
import { useGSAP } from '../composables/useGSAP'
import ProductCard from './ProductCard.vue'
import { useCart } from '../composables/useCart'

const products = useProducts()
const gsap = useGSAP()
const cart = useCart()

onMounted(async () => {
  // Cargar datos si no están cargados
  if (products.allProducts.length === 0) {
    await products.initializeData()
  }

  gsap.staggerElements('.product-card', {
    duration: 0.6,
    stagger: 0.1,
    delay: 0.2
  })
})

const handleAddToCart = (product: any) => {
  if (product.stock <= 0) return
  cart.addToCart(product, 1, product.tallas[0])
}
</script>

<template>
  <section class="bg-surface-container-low py-section-gap px-margin-mobile md:px-margin-desktop">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-end mb-12 md:mb-16">
        <div>
          <span class="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Colección 2024</span>
          <h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mt-2">Nuevos Lanzamientos</h2>
        </div>
        <router-link to="/catalogo" class="hidden md:block font-label-caps text-label-caps border-b-2 border-ink-black pb-1 hover:opacity-60 transition-opacity uppercase">
          Ver Todos
        </router-link>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <ProductCard 
          v-for="product in products.getNewArrivals()"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <!-- Mobile View All Button -->
      <router-link to="/catalogo" class="md:hidden block w-full mt-8 text-center bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity">
        Ver Todos los Productos
      </router-link>
    </div>
  </section>
</template>
