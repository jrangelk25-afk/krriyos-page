<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useProducts } from '../composables/useProducts'
import categoryL from '/category-l.webp?url'
import categoryR from '/category-r.webp?url'

const router = useRouter()
const products = useProducts()
const leftShoeRef = ref<HTMLDivElement | null>(null)
const centerContentRef = ref<HTMLDivElement | null>(null)
const rightShoeRef = ref<HTMLDivElement | null>(null)

const isLeftShoeVisible = ref(false)
const isCenterVisible = ref(false)
const isRightShoeVisible = ref(false)

const goToCategoryPage = (categoryId: string) => {
  router.push(`/catalogo?categoria=${categoryId}`)
}

const goToCatalog = () => {
  router.push('/catalogo')
}

// Obtener la primera imagen de un producto de la categoría para usar como placeholder
const getImageForCategory = (categoryId: string) => {
  const category = products.categories.find((c: any) => c.id === categoryId)
  if (!category) return categoryL

  // Buscar un producto en esta categoría que tenga imagen
  const product = products.allProducts.find((p: any) => p.categoryId === categoryId && p.imagenes?.length > 0)
  return product?.imagenes[0] || categoryL
}

onMounted(async () => {
  // Cargar categorías desde la BD
  await products.initializeData()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === leftShoeRef.value && entry.isIntersecting) {
          isLeftShoeVisible.value = true
          observer.unobserve(entry.target)
        }
        if (entry.target === centerContentRef.value && entry.isIntersecting) {
          isCenterVisible.value = true
          observer.unobserve(entry.target)
        }
        if (entry.target === rightShoeRef.value && entry.isIntersecting) {
          isRightShoeVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.3 }
  )

  if (leftShoeRef.value) observer.observe(leftShoeRef.value)
  if (centerContentRef.value) observer.observe(centerContentRef.value)
  if (rightShoeRef.value) observer.observe(rightShoeRef.value)
})
</script>

<template>
  <section class="w-full">
    <!-- Banner Superior - Minimalista con bordes de color -->
    <div class="bg-surface-product py-8 md:py-12 lg:py-16 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Grid con zapatos a los lados y texto al centro -->
        <div class="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16">
          <!-- Zapato Izquierdo con borde -->
          <div 
            ref="leftShoeRef"
            :class="['flex-shrink-0 w-24 md:w-28 lg:w-32', { 'is-visible': isLeftShoeVisible }]"
            class="category-slide-left"
          >
            <div class="border-4 md:border-6 border-secondary overflow-hidden bg-white aspect-square flex items-center justify-center p-2 md:p-3">
              <img 
                :src="categoryL"
                alt="Producto izquierda"
                class="w-full h-full object-contain"
              />
            </div>
          </div>

          <!-- Contenido Central -->
          <div 
            ref="centerContentRef"
            :class="['category-center-text', { 'is-visible': isCenterVisible }]"
            class="text-center flex-1 max-w-md"
          >
            <h2 class="font-display-sm md:font-display-md text-headline-lg-mobile md:text-display-md text-ink-black uppercase mb-3 md:mb-6 leading-tight tracking-widest font-bold">
              Camina con<br/>propósito<br/>vive con fuerza
            </h2>
            <p class="font-body-sm md:font-body-md text-body-sm md:text-body-md text-ink-black/70 mb-6 md:mb-8 text-xs md:text-base leading-relaxed">
              ¡Te acompañamos a dónde quieras que vayas!
            </p>
            <button 
              @click="goToCatalog"
              class="bg-ink-black text-on-primary px-6 md:px-8 py-2.5 md:py-3.5 font-label-caps text-label-caps uppercase text-xs md:text-sm tracking-widest hover:bg-secondary hover:text-ink-black transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Descubrelo Ahora
            </button>
          </div>

          <!-- Zapato Derecho con borde -->
          <div 
            ref="rightShoeRef"
            :class="['flex-shrink-0 w-24 md:w-28 lg:w-32', { 'is-visible': isRightShoeVisible }]"
            class="category-slide-right"
          >
            <div class="border-4 md:border-6 border-secondary overflow-hidden bg-white aspect-square flex items-center justify-center p-2 md:p-3">
              <img 
                :src="categoryR"
                alt="Producto derecha"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Categorías -->
    <div class="py-8 md:py-6 px-2 md:px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Grid principal: 1 grande a la izquierda, 2 apiladas a la derecha -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:grid-rows-2">
          <!-- Categoría Grande Izquierda (ocupa 2 filas) -->
          <div 
            v-if="products.categories.length > 0"
            @click="() => goToCategoryPage(products.categories[0].id)"
            class="md:row-span-2 relative group cursor-pointer h-[30rem]"
          >
            <div class="w-full h-full bg-surface-product overflow-hidden rounded-lg">
              <img 
                :src="getImageForCategory(products.categories[0].id)"
                :alt="products.categories[0].name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-ink-black/80 via-ink-black/30 to-transparent rounded-lg">
              <div></div>
              <div class="text-on-primary w-full">
                <h3 class="font-display-sm md:font-display-md text-display-sm md:text-display-md uppercase mb-2 md:mb-3 tracking-widest font-bold">{{ products.categories[0].name }}</h3>
                <p class="font-label-md text-label-md uppercase mb-3 md:mb-4 text-xs md:text-sm tracking-wider">{{ products.categories[0].description }}</p>
                <button class="border-2 border-on-primary text-on-primary px-4 md:px-5 py-2 md:py-2.5 font-label-caps text-label-caps uppercase text-xs md:text-xs hover:bg-on-primary hover:text-ink-black transition-all duration-300 tracking-widest">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          <!-- Categoría 2 (arriba derecha) -->
          <div 
            v-if="products.categories.length > 1"
            @click="() => goToCategoryPage(products.categories[1].id)"
            class="relative group cursor-pointer h-56"
          >
            <div class="w-full h-full bg-surface-product overflow-hidden rounded-lg">
              <img 
                :src="getImageForCategory(products.categories[1].id)"
                :alt="products.categories[1].name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-ink-black/80 via-ink-black/30 to-transparent rounded-lg">
              <div></div>
              <div class="text-on-primary w-full">
                <h3 class="font-display-sm md:font-display-md text-display-sm md:text-display-md uppercase mb-2 md:mb-3 tracking-widest font-bold">{{ products.categories[1].name }}</h3>
                <p class="font-label-md text-label-md uppercase mb-3 md:mb-4 text-xs md:text-sm tracking-wider">{{ products.categories[1].description }}</p>
                <button class="border-2 border-on-primary text-on-primary px-4 md:px-5 py-2 md:py-2.5 font-label-caps text-label-caps uppercase text-xs md:text-xs hover:bg-on-primary hover:text-ink-black transition-all duration-300 tracking-widest">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          <!-- Categoría 3 (abajo derecha) -->
          <div 
            v-if="products.categories.length > 2"
            @click="() => goToCategoryPage(products.categories[2].id)"
            class="relative group cursor-pointer h-56"
          >
            <div class="w-full h-full bg-surface-product overflow-hidden rounded-lg">
              <img 
                :src="getImageForCategory(products.categories[2].id)"
                :alt="products.categories[2].name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-ink-black/80 via-ink-black/30 to-transparent rounded-lg">
              <div></div>
              <div class="text-on-primary w-full">
                <h3 class="font-display-sm md:font-display-md text-display-sm md:text-display-md uppercase mb-2 md:mb-3 tracking-widest font-bold">{{ products.categories[2].name }}</h3>
                <p class="font-label-md text-label-md uppercase mb-3 md:mb-4 text-xs md:text-sm tracking-wider">{{ products.categories[2].description }}</p>
                <button class="border-2 border-on-primary text-on-primary px-4 md:px-5 py-2 md:py-2.5 font-label-caps text-label-caps uppercase text-xs md:text-xs hover:bg-on-primary hover:text-ink-black transition-all duration-300 tracking-widest">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes slideLeft {
  from {
    transform: translateX(-60px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRight {
  from {
    transform: translateX(60px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInScale {
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.category-slide-left {
  opacity: 0;
  transform: translateX(-60px);
}

.category-slide-left.is-visible {
  animation: slideLeft 0.8s ease-out 0.2s forwards;
}

.category-slide-right {
  opacity: 0;
  transform: translateX(60px);
}

.category-slide-right.is-visible {
  animation: slideRight 0.8s ease-out 0.2s forwards;
}

.category-center-text {
  opacity: 0;
  transform: scale(0.98);
}

.category-center-text.is-visible {
  animation: fadeInScale 0.8s ease-out 0.1s forwards;
}
</style>
