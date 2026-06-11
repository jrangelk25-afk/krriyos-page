<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import CartDrawer from './CartDrawer.vue'

const router = useRouter()
const cartStore = useCartStore()

const goHome = () => router.push('/')
const goCatalog = () => router.push('/catalogo')
const toggleCart = () => cartStore.toggleDrawer()
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-40 bg-surface border-b border-outline-variant h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop transition-all duration-300">
    <div class="flex items-center gap-12">
      <!-- Logo -->
      <button 
        @click="goHome" 
        class="h-8 hover:opacity-80 transition-opacity"
        aria-label="krriyos - volver a inicio"
      >
        <img 
          alt="krriyos logo" 
          class="h-full object-contain" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbNLkdUzYnqQPzJlRaRwwYgZ7UCDB4OpqdWTRiI997yYRmYOmElaIzT6VpuqLlXQ-LJIZEg-geJnmp8vt-TRemQrdXLr8qt7IGkWOo8Rytf09-iCiH9CSBZyRCQDS88-Nv8fnyTMPn0gnL4ew1mAcwDhVYTAquU9s40mmxPzdEuHQTwUK8X_qOSRMNtmMd11EKUWLYbhpP8pyEhfn_dLF4czGO9ha_boMtjqW3-V7F2vyWM8iQKrRFVz6H52u0WgaRv4MEj7Ijs8uV"
        />
      </button>

      <!-- Navigation -->
      <nav class="hidden md:flex gap-8 items-center">
        <button 
          @click="goHome"
          class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
          aria-label="Ir a página de inicio"
        >
          Inicio
        </button>
        <button 
          @click="goCatalog"
          class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
          aria-label="Ir al catálogo de productos"
        >
          Catálogo
        </button>
      </nav>
    </div>

    <!-- Right section with cart icon -->
    <div class="flex items-center gap-4">
      <button 
        @click="toggleCart" 
        class="relative p-2 hover:bg-surface-container rounded-lg transition-colors duration-300"
        :aria-label="`Carrito de compras: ${cartStore.cartCount} productos`"
        :aria-expanded="cartStore.isOpen"
      >
        <span class="material-symbols-outlined text-on-surface" aria-hidden="true">shopping_bag</span>
        <span 
          v-if="cartStore.cartCount > 0"
          class="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold"
          aria-label="`${cartStore.cartCount} producto(s) en el carrito`"
        >
          {{ cartStore.cartCount }}
        </span>
      </button>
    </div>

    <!-- Mobile cart drawer -->
    <CartDrawer />
  </header>
</template>
