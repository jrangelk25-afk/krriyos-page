<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useProducts } from '../composables/useProducts'
import CartDrawer from './CartDrawer.vue'

const router = useRouter()
const cartStore = useCartStore()
const products = useProducts()
const showCategoriesDropdown = ref(false)
const showMobileMenu = ref(false)
const categories = ref<any[]>([])

const goHome = () => {
  router.push('/')
  showCategoriesDropdown.value = false
}

onMounted(async () => {
  // Cargar categorías si no están cargadas
  if (products.categories.length === 0) {
    await products.loadCategories()
  }
  categories.value = products.categories
})

const goOutlet = () => {
  router.push('/outlet')
  showCategoriesDropdown.value = false
}

const goNewArrivals = () => {
  router.push('/nuevos')
  showCategoriesDropdown.value = false
}

const goCategory = (categoryId: string) => {
  router.push(`/catalogo?category=${categoryId}`)
  showCategoriesDropdown.value = false
}

const goAbout = () => {
  router.push('/nosotros')
  showCategoriesDropdown.value = false
}

const toggleCart = () => cartStore.toggleDrawer()

const toggleCategoriesDropdown = () => {
  showCategoriesDropdown.value = !showCategoriesDropdown.value
}

const closeCategoriesDropdown = () => {
  showCategoriesDropdown.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const handleMobileNavigation = (callback: () => void) => {
  callback()
  closeMobileMenu()
}
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-40 bg-surface border-b border-outline-variant h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop transition-all duration-300">
    <div class="flex items-center gap-12">
      <!-- Logo -->
      <button 
        @click="goHome" 
        class="h-12 hover:opacity-80 transition-opacity"
        aria-label="krriyos - volver a inicio"
      >
        <img 
          alt="krriyos logo" 
          class="h-full object-contain" 
          src="/logo.webp"
        />
      </button>

      <!-- Navigation -->
      <nav class="hidden md:flex gap-8 items-center relative">
        <!-- Colecciones dropdown -->
        <div class="relative group">
          <button 
            @click="toggleCategoriesDropdown"
            class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 flex items-center gap-2"
            aria-label="Ver categorías"
            aria-haspopup="true"
            :aria-expanded="showCategoriesDropdown"
          >
            Colecciones
            <span class="material-symbols-outlined text-sm" :class="showCategoriesDropdown ? 'rotate-180' : ''">
              expand_more
            </span>
          </button>

          <!-- Dropdown menu -->
          <div 
            v-show="showCategoriesDropdown"
            @mouseleave="closeCategoriesDropdown"
            class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-outline-variant overflow-hidden z-50"
          >
            <div class="py-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="goCategory(category.id)"
                class="w-full text-left px-6 py-3 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200 text-label-caps uppercase font-label-caps"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Outlet link -->
        <button 
          @click="goOutlet"
          class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
          aria-label="Ver productos en outlet"
        >
          Outlet
        </button>

        <!-- New link -->
        <button 
          @click="goNewArrivals"
          class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
          aria-label="Ver nuevos productos"
        >
          New
        </button>

        <!-- Nosotros link -->
        <button 
          @click="goAbout"
          class="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
          aria-label="Conocer nuestra historia"
        >
          Nosotros
        </button>
      </nav>
    </div>

    <!-- Right section with cart icon and mobile menu -->
    <div class="flex items-center gap-2 md:gap-4">
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

      <!-- Mobile menu button -->
      <button 
        @click="toggleMobileMenu"
        class="md:hidden p-2 hover:bg-surface-container rounded-lg transition-colors duration-300"
        aria-label="Abrir menú de navegación"
        :aria-expanded="showMobileMenu"
      >
        <span class="material-symbols-outlined text-on-surface" aria-hidden="true">
          {{ showMobileMenu ? 'close' : 'menu' }}
        </span>
      </button>
    </div>

    <!-- Mobile menu drawer -->
    <div 
      v-if="showMobileMenu"
      class="fixed top-20 left-0 right-0 w-full bg-surface border-b border-outline-variant shadow-lg md:hidden z-40"
    >
      <nav class="flex flex-col p-4 gap-2">
        <!-- Colecciones dropdown for mobile -->
        <div class="relative">
          <button 
            @click="toggleCategoriesDropdown"
            class="w-full text-left font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 py-3 px-4 hover:bg-surface-container rounded-lg flex items-center justify-between"
            aria-label="Ver categorías"
            aria-haspopup="true"
            :aria-expanded="showCategoriesDropdown"
          >
            Colecciones
            <span class="material-symbols-outlined text-sm" :class="showCategoriesDropdown ? 'rotate-180' : ''">
              expand_more
            </span>
          </button>

          <!-- Categories submenu for mobile -->
          <div 
            v-if="showCategoriesDropdown"
            class="pl-4 py-2 bg-surface-container rounded-lg mt-1"
          >
            <button
              v-for="category in categories"
              :key="category.id"
              @click="handleMobileNavigation(() => goCategory(category.id))"
              class="w-full text-left px-4 py-2 text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors duration-200 text-label-caps uppercase font-label-caps rounded"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Outlet link -->
        <button 
          @click="handleMobileNavigation(() => goOutlet())"
          class="w-full text-left font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 py-3 px-4 hover:bg-surface-container rounded-lg"
          aria-label="Ver productos en outlet"
        >
          Outlet
        </button>

        <!-- New link -->
        <button 
          @click="handleMobileNavigation(() => goNewArrivals())"
          class="w-full text-left font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 py-3 px-4 hover:bg-surface-container rounded-lg"
          aria-label="Ver nuevos productos"
        >
          New
        </button>

        <!-- Nosotros link -->
        <button 
          @click="handleMobileNavigation(() => goAbout())"
          class="w-full text-left font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 py-3 px-4 hover:bg-surface-container rounded-lg"
          aria-label="Conocer nuestra historia"
        >
          Nosotros
        </button>
      </nav>
    </div>

    <!-- Mobile cart drawer -->
    <CartDrawer />
  </header>
</template>
