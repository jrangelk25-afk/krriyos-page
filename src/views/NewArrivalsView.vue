<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'
import { useMetaTags } from '../composables/useMeta'
import ProductCard from '../components/ProductCard.vue'

const products = useProducts()
const cart = useCart()

const sortBy = ref<string>('nombre')
const isLoading = ref(false)
const componentMounted = ref(false)
const transitionKey = ref(0)

onMounted(async () => {
  // Actualizar meta tags para nuevos
  useMetaTags({
    title: 'Nuevos | krriyos - Últimas Llegadas en Calzado Premium',
    description: 'Descubre los últimos lanzamientos en sneakers, urban wear y botas. Nuevos estilos cada semana.',
    image: '/logo.webp',
    url: '/nuevos',
    type: 'website',
  })

  // SIEMPRE limpiar filtros al entrar a la vista de nuevos
  products.clearFilters()
  
  // Cargar datos desde la BD si no están cargados
  if (products.allProducts.length === 0) {
    await products.initializeData()
  }

  // Aplicar filtro de nuevos productos
  products.applyFilter({ isNew: true as any })

  // Marcar como montado para evitar que watchers se disparen durante setup
  componentMounted.value = true
})

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

const clearNewFilter = () => {
  products.clearFilters()
  sortBy.value = 'nombre'
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-surface-product/30">
    <div class="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="mb-8 text-sm text-on-surface-variant">
        <a href="/" class="hover:text-primary transition-colors">Inicio</a>
        <span class="mx-2">/</span>
        <span class="text-on-surface font-medium">Nueva Colección</span>
      </div>

      <!-- Header -->
      <div class="mb-8 header-animation">
        <h1 class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface uppercase mb-2">
          Nueva Colección
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Lo último en tendencias. Diseños exclusivos que acaban de llegar
        </p>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col">
        <!-- Results Info and Sort -->
        <div class="mb-6 flex items-center justify-between">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando 
            <span class="font-semibold text-on-surface">{{ products.filteredProducts.length }}</span>
            nuevos productos
          </p>
          
          <!-- Sort Options -->
          <div class="flex items-center gap-3">
            <label class="font-label-caps text-label-caps text-on-surface-variant">Ordenar:</label>
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
            >
              <option value="nombre">Nombre A-Z</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <!-- Products Grid -->
        <div 
          :key="transitionKey"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 transition-opacity duration-300 animate-fadeIn"
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
            Próximamente nuevos diseños exclusivos.
          </p>
          <a 
            href="/catalogo"
            class="bg-ink-black text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase hover:bg-secondary transition-colors duration-300 inline-block"
          >
            Explorar Catálogo
          </a>
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
  opacity: 0;
}

.product-card:nth-child(1) { animation-delay: 0ms; }
.product-card:nth-child(2) { animation-delay: 80ms; }
.product-card:nth-child(3) { animation-delay: 160ms; }
.product-card:nth-child(4) { animation-delay: 240ms; }
.product-card:nth-child(n+5) { animation-delay: calc((var(--index) - 4) * 80ms); }

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slideInUp {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
}
</style>
