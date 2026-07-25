<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'
import ProductCard from '../components/ProductCard.vue'
import CatalogFilters from '../components/CatalogFilters.vue'

const route = useRoute()
const products = useProducts()
const cart = useCart()

const selectedCategory = ref<string | null>(null)
const sortBy = ref<string>('nombre')
const showOutlet = ref(false)
const showNewArrivals = ref(false)
const isLoading = ref(false)
const componentMounted = ref(false)
const transitionKey = ref(0)

onMounted(async () => {
  // SIEMPRE limpiar filtros al entrar a la vista del catálogo
  products.clearFilters()
  
  // Cargar datos desde la BD si no están cargados
  if (products.allProducts.length === 0) {
    await products.initializeData()
  }

  // Check URL query parameters y aplicar filtros
  if (route.query.category) {
    const categoryId = route.query.category as string
    selectedCategory.value = categoryId
    products.filterByCategory(categoryId)
  } else if (route.query.outlet === 'true') {
    showOutlet.value = true
    products.applyFilter({ isOutlet: true as any })
  } else if (route.query.new === 'true') {
    showNewArrivals.value = true
    products.applyFilter({ isNew: true as any })
  }

  // Marcar como montado para evitar que watchers se disparen durante setup
  componentMounted.value = true
})

watch([selectedCategory, showOutlet, showNewArrivals], async ([newCategory, newOutlet, newNew]) => {
  if (!componentMounted.value) return
  
  isLoading.value = true
  
  // Aplicar filtros mediante la store
  if (newCategory) {
    products.filterByCategory(newCategory)
  } else if (newOutlet) {
    products.applyFilter({ isOutlet: true as any })
  } else if (newNew) {
    products.applyFilter({ isNew: true as any })
  } else {
    products.clearFilters()
  }
  
  // Re-render con nueva key para CSS animation
  transitionKey.value++
  
  // Pequeño delay para que se complete la transición
  await new Promise(resolve => setTimeout(resolve, 300))
  isLoading.value = false
}, { flush: 'post' })

watch(sortBy, async (newSort) => {
  if (!componentMounted.value) return
  
  isLoading.value = true
  products.sortBy(newSort)
  
  // Re-render con nueva key
  transitionKey.value++
  
  await new Promise(resolve => setTimeout(resolve, 300))
  isLoading.value = false
})

const handleAddToCart = (product: any) => {
  if (product.stock <= 0) return
  cart.addToCart(product, 1, product.tallas[0])
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-surface-product/30">
    <div class="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="mb-8 text-sm text-on-surface-variant">
        <a href="/" class="hover:text-primary transition-colors">Inicio</a>
        <span class="mx-2">/</span>
        <span class="text-on-surface font-medium">Catálogo</span>
      </div>

      <!-- Header -->
      <div class="mb-8 header-animation">
        <h1 class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface uppercase mb-2">
          Nuestro Catálogo
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Descubre nuestra colección completa de productos premium
        </p>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col lg:flex-row gap-0 lg:gap-12">
        <!-- Sidebar Filters -->
        <CatalogFilters
          :selectedCategory="selectedCategory"
          :sortBy="sortBy"
          @update:selectedCategory="selectedCategory = $event"
          @update:sortBy="sortBy = $event"
        />

        <!-- Products Section -->
        <div class="flex-1">
          <!-- Results Info -->
          <div class="mb-6 flex items-center justify-between">
            <p class="font-body-md text-body-md text-on-surface-variant">
              Mostrando 
              <span class="font-semibold text-on-surface">{{ products.filteredProducts.length }}</span>
              resultados
            </p>
          </div>

          <!-- Products Grid -->
          <div 
            :key="transitionKey"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 transition-opacity duration-300 animate-fadeIn"
            :class="{ 'opacity-50': isLoading }"
          >
            <ProductCard 
              v-for="product in products.filteredProducts"
              :key="product.id"
              :product="product"
              class="product-card animate-slideInUp"
              @add-to-cart="handleAddToCart"
            />
          </div>

          <!-- Empty State -->
          <div v-if="products.filteredProducts.length === 0" class="text-center py-20 empty-state-animation">
            <p class="font-body-lg text-body-lg text-on-surface-variant mb-6">
              No hay productos que coincidan con los filtros seleccionados.
            </p>
            <button 
              @click="selectedCategory = null; sortBy = 'nombre'"
              class="bg-ink-black text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase hover:bg-secondary transition-colors duration-300"
            >
              Ver Todos los Productos
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideInHeader {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header-animation {
  animation: slideInHeader 0.6s ease-out;
}

.empty-state-animation {
  animation: slideInUp 0.6s ease-out;
}

.product-card {
  will-change: opacity, transform;
  animation: slideInUp 0.6s ease-out forwards;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slideInUp {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
}

.product-card:nth-child(1) { animation-delay: 0ms; }
.product-card:nth-child(2) { animation-delay: 80ms; }
.product-card:nth-child(3) { animation-delay: 160ms; }
.product-card:nth-child(n+4) { animation-delay: calc((var(--index) - 3) * 80ms); }
</style>
