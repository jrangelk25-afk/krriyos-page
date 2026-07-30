<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'
import { useMetaTags } from '../composables/useMeta'
import { useMagnifier } from '../composables/useMagnifier'
import ProductSizeColorMatrix from '../components/ProductSizeColorMatrix.vue'

const route = useRoute()
const router = useRouter()
const products = useProducts()
const cart = useCart()

const product = ref<any | null>(null)
const isLoading = ref(false)
const currentImageIndex = ref<number>(0)

// Inicializar magnifier para imagen principal
const mainMagnifier = useMagnifier(2.5)

// Cargar producto del servidor (para obtener todos los colores correctamente)
onMounted(async () => {
  isLoading.value = true
  const productId = route.params.id as string
  
  try {
    // Intentar obtener del store primero
    let prod: any = products.getById(productId)
    
    // Si no está en el store, cargar del servidor
    if (!prod) {
      prod = await products.loadProductById(productId)
    }
    
    product.value = prod || null
    
    if (!product.value) {
      router.push('/catalogo')
    } else {
      // Actualizar meta tags con información del producto
      const imageUrl = product.value.imagenes?.[0] || '/logo.webp'
      const description = product.value.descripcion 
        ? product.value.descripcion.split('\n')[0].substring(0, 160)
        : `${product.value.nombre} - Calzado premium de Krriyos`

      useMetaTags({
        title: `${product.value.nombre} | krriyos - Orgullosos de Caminar Contigo`,
        description: description,
        image: imageUrl,
        url: `/producto/${product.value.id}`,
        type: 'product',
      })
    }
  } catch (error) {
    console.error('Error loading product:', error)
    router.push('/catalogo')
  } finally {
    isLoading.value = false
  }
})

const handleAddToCart = (details: {
  size: string
  colorId: string
  colorName: string
  quantity: number
}) => {
  if (!product.value) return

  // Agregar al carrito con talla + color
  cart.addToCart(
    product.value,
    details.quantity,
    details.size,
    details.colorId,
    details.colorName
  )

  // Feedback visual
  alert(`${details.quantity}x ${product.value.nombre} - Talla ${details.size} ${details.colorName} agregado al carrito`)
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

// Calcular precio con descuento
const precioConDescuento = computed(() => {
  if (!product.value) return 0
  if (product.value.isOutlet && product.value.discountPercentage) {
    const descuento = (product.value.precio * product.value.discountPercentage) / 100
    return product.value.precio - descuento
  }
  return product.value.precio
})

const descuentoAplicado = computed(() => {
  if (!product.value) return 0
  return product.value.isOutlet && product.value.discountPercentage ? product.value.discountPercentage : 0
})
</script>

<template>
  <div v-if="product" class="min-h-[calc(100vh-80px)] bg-surface">
    <div class="px-margin-mobile md:px-margin-desktop py-6 md:py-8 max-w-7xl mx-auto">
      <!-- Back Button -->
      <button 
        @click="goBack"
        class="inline-flex items-center gap-2 font-label-md text-label-md text-primary uppercase hover:opacity-70 transition-opacity mb-4"
      >
        <span class="material-symbols-outlined">chevron_left</span>
        Volver
      </button>

      <!-- Main Layout: Large image LEFT | Details + Selector RIGHT -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        
        <!-- LEFT: LARGE IMAGE GALLERY (1/2) -->
        <div class="flex flex-col gap-3 order-1 lg:order-1">
          <!-- Main Image -->
          <div 
            class="aspect-[1/1.2] bg-surface-product rounded-xl overflow-hidden relative shadow-lg group"
            @mousemove="mainMagnifier.handleMouseMove"
            @mouseenter="mainMagnifier.handleMouseEnter"
            @mouseleave="mainMagnifier.handleMouseLeave"
          >
            <img 
              :src="product.imagenes[currentImageIndex]"
              :alt="product.nombre"
              class="w-full h-full object-cover"
            />
            
            <!-- Magnifier Glass -->
            <div 
              v-if="mainMagnifier.showMagnifier.value"
              class="magnifier-glass absolute pointer-events-none rounded-full border-2 border-primary/70 overflow-hidden shadow-lg"
              :style="[
                mainMagnifier.magnifierStyle.value,
                mainMagnifier.zoomedImageStyle.value,
                {
                  backgroundImage: `url('${product.imagenes[currentImageIndex]}')`
                }
              ]"
            >
            </div>
            
            <!-- Image navigation -->
            <div v-if="product.imagenes.length > 1" class="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                @click="prevImage"
                class="bg-primary/90 hover:bg-primary text-on-primary p-2 rounded-full shadow-lg transition-all active:scale-95"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                @click="nextImage"
                class="bg-primary/90 hover:bg-primary text-on-primary p-2 rounded-full shadow-lg transition-all active:scale-95"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <!-- Image counter -->
            <div v-if="product.imagenes.length > 1" class="absolute bottom-3 right-3 bg-ink-black/70 text-on-primary rounded-full px-2 py-1">
              <p class="font-label-sm text-xs">{{ currentImageIndex + 1 }}/{{ product.imagenes.length }}</p>
            </div>
          </div>

          <!-- Thumbnails horizontal -->
          <div v-if="product.imagenes.length > 1" class="flex gap-2 overflow-x-auto pb-1">
            <button 
              v-for="(img, index) in product.imagenes"
              :key="index"
              @click="currentImageIndex = Number(index)"
              :class="[
                'flex-shrink-0 w-14 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentImageIndex 
                  ? 'border-primary shadow-md' 
                  : 'border-outline-variant hover:border-primary'
              ]"
            >
              <img 
                :src="img"
                :alt="`Thumbnail ${Number(index) + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- RIGHT: DETAILS + SELECTOR (1/2) -->
        <div class="flex flex-col gap-4 order-2 lg:order-2">
          
          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <!-- PRICE & BASIC INFO -->
          <div v-show="!isLoading" class="space-y-2">
            <!-- Precio -->
            <div class="space-y-1">
              <div v-if="descuentoAplicado > 0" class="flex items-center gap-3">
                <p class="font-headline-md text-headline-md text-error font-bold">
                  {{ formatCurrency(precioConDescuento) }}
                </p>
                <p class="text-sm text-on-surface-variant line-through">
                  {{ formatCurrency(product.precio) }}
                </p>
                <span class="bg-error text-on-error text-[11px] font-bold px-2 py-0.5 rounded">
                  -{{ descuentoAplicado }}%
                </span>
              </div>
              <p v-else class="font-headline-md text-headline-md text-primary">
                {{ formatCurrency(product.precio) }}
              </p>
            </div>

            <!-- Link guía tallas -->
            <a href="#" class="inline-block text-primary font-label-xs text-xs uppercase hover:underline">
              Guía de tallas →
            </a>
          </div>

          <!-- PRODUCT DETAILS -->
          <div v-show="!isLoading" class="space-y-2 border-t border-b border-outline-variant py-3">
            <!-- Nombre -->
            <div>
              <h1 class="font-headline-sm text-headline-sm text-on-surface">
                {{ product.nombre }}
              </h1>
            </div>

            <!-- SKU -->
            <p class="font-label-xs text-xs text-on-surface-variant uppercase">
              SKU: {{ product.sku }}
            </p>

            <!-- Category -->
            <div>
              <p class="font-label-xs text-xs text-on-surface-variant uppercase mb-1">Categoría</p>
              <p class="font-body-sm text-sm text-on-surface">{{ product.categoria }}</p>
            </div>

            <!-- Description -->
            <div v-if="product.descripcion">
              <p class="font-label-xs text-xs text-on-surface-variant uppercase mb-1">Descripción</p>
              <ul class="space-y-0.5">
                <li v-for="(line, idx) in product.descripcion.split('\n')" :key="idx" class="font-body-xs text-xs text-on-surface-variant flex items-start gap-2">
                  <span class="text-primary mt-0.5">•</span>
                  <span>{{ line }}</span>
                </li>
              </ul>
            </div>

            <!-- Stock Status -->
            <div v-if="product.stock > 0" class="flex items-center gap-2 text-success">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span class="font-label-xs text-xs">En Stock</span>
            </div>
            <div v-else class="flex items-center gap-2 text-error">
              <span class="material-symbols-outlined text-sm">cancel</span>
              <span class="font-label-xs text-xs">Agotado</span>
            </div>
          </div>

          <!-- SIZE & COLOR SELECTOR -->
          <div v-if="product.stock > 0 && !isLoading" class="space-y-3">
            <ProductSizeColorMatrix 
              :product-id="product.id"
              :product-name="product.nombre"
              @add-to-cart="handleAddToCart"
            />

            <!-- Size Chart Below Selector -->
            <div class="space-y-2 pt-2">
              <p class="font-label-xs text-xs text-on-surface-variant uppercase mb-2">Tabla de Tallas</p>
              <div class="relative overflow-hidden rounded-lg border-2 border-outline-variant">
                <img 
                  src="/tabla_tallas.webp"
                  alt="Tabla de tallas"
                  class="w-full h-auto object-contain bg-surface-product max-h-48"
                />
              </div>
            </div>
          </div>

          <div v-else-if="!isLoading" class="bg-surface-bright rounded-lg p-4 border-2 border-error/20 text-center">
            <p class="text-on-surface-variant font-body-md">
              Producto no disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="min-h-[calc(100vh-80px)] flex items-center justify-center">
    <div class="text-center space-y-4">
      <span class="material-symbols-outlined text-6xl text-on-surface-variant opacity-50">error</span>
      <p class="font-body-lg text-on-surface-variant">Producto no encontrado</p>
      <button 
        @click="goBack"
        class="inline-block px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md uppercase hover:opacity-90"
      >
        Volver
      </button>
    </div>
  </div>
</template>

<style scoped>
.magnifier-glass {
  animation: magnifierPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.4),
    inset 0 0 10px rgba(255, 255, 255, 0.1),
    0 0 0 2px rgba(59, 130, 246, 0.5);
}

@keyframes magnifierPop {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
