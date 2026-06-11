<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const leftShoeRef = ref<HTMLDivElement | null>(null)
const centerContentRef = ref<HTMLDivElement | null>(null)
const rightShoeRef = ref<HTMLDivElement | null>(null)

const isLeftShoeVisible = ref(false)
const isCenterVisible = ref(false)
const isRightShoeVisible = ref(false)

const categories = [
  {
    id: 'sneakers',
    name: 'SNEAKERS',
    description: 'La ingeniería del movimiento',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBADvoF_123k6ucLHyofdUrLXhCS6X6KySpiXRJ7nUYVgUpRHa0jFgrjnGt9WuaiGeglXlzJqAmLhc7edyc2ssQ0OL_QU5rqEtm5Uo_-pBj1jfDATOlXClqGqTcYyk2x76-EENH-uvlQig1UitJkYv7OFrwNWFNlFea0kh7U1QoHuwiCDT8gw0VR0m-_OOQX8bEGhfAON0dyF7ue7tL4Si-1hO5hDwkRG6EXS7amthFROlZQDhVOvVOx2cmV3Bfkc0IAGPxgX9YdsRG'
  },
  {
    id: 'urban',
    name: 'URBAN',
    description: 'Versatilidad sin compromiso',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpH-kIvqVGBiMyqrPhgFYgte-Ihw4uJDNdxaW9I6cHNz76AFIyRUv4MJlXn98PTUj-fVTUrFYg9xOALgHizydTg_KJ13Qlqv_nQ95i2KVWWd9CJUjyTpQMGEhsq-SUq1EOUBR03woIvD4iIwm0qgOPAr2zQk5AkDORXyHfliLB6wuIJHZVWolvXSjUf3EJAHoPtrYFMhyj9yQHkfOF20AyCnHeSxIewa8ENjYH6dtvI8t2yl5K0nxzKfCv-i9GXX50oRJeK_W1E30D'
  },
  {
    id: 'botas',
    name: 'BOTAS',
    description: 'Aventura extrema',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZXuke-5GLKlgj3uifVBb-Y0nXRA8U4C6WgIJQoQMfeQRhjsydEyDNKVlE6IueLAiBHWmno5QFe-wpSoxs7liPKnnIJP1D6s2aR4nLivUtuacUDPg00dKwKTe8Ujd5MUIgXhn5XdXuAfg5VOazug3fOE5kaoxM3wyAR3L68hDo_k7QkrOsAJzhKJq10T53ORch7MknFhZryma5cl1HztRpJu_Z9y9A7y56JW3lwBRn3KYee_d8eecbZzEbXkHWVJfNYWdwpXHyIi0'
  }
]

const goToCategoryPage = (categoryId: string) => {
  router.push(`/catalogo?categoria=${categoryId}`)
}

const goToCatalog = () => {
  router.push('/catalogo')
}

onMounted(() => {
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
    <div class="bg-surface-product py-12 md:py-20 lg:py-28 px-4 md:px-8">
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
                src="/category-l.png"
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
                src="/category-r.png"
                alt="Producto derecha"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Categorías -->
    <div class="py-6 md:py-10 lg:py-14 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-3 items-start">
          <!-- Categoría Izquierda Grande -->
          <div 
            @click="() => goToCategoryPage('sneakers')"
            class="lg:col-span-5 relative group cursor-pointer"
          >
            <div class="aspect-square md:aspect-[4/5] bg-surface-product overflow-hidden rounded-lg">
              <img 
                :src="categories[0].image"
                :alt="categories[0].name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="mt-2 md:mt-3">
              <h3 class="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md uppercase text-sm md:text-base tracking-wider">{{ categories[0].name }}</h3>
              <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mt-0.5 md:mt-1 text-xs md:text-sm">{{ categories[0].description }}</p>
              <button class="mt-2 md:mt-2 border-2 border-ink-black text-ink-black px-3 md:px-4 py-1 md:py-1.5 font-label-caps text-label-caps uppercase text-xs md:text-sm hover:bg-ink-black hover:text-on-primary transition-all duration-300 tracking-wider">
                Buy Now
              </button>
            </div>
          </div>

          <!-- Spacer -->
          <div class="hidden lg:block lg:col-span-1"></div>

          <!-- Categorías Derecha -->
          <div class="lg:col-span-6 flex flex-col gap-2 md:gap-3">
            <!-- Urban -->
            <div 
              @click="() => goToCategoryPage('urban')"
              class="relative group cursor-pointer"
            >
              <div class="aspect-video md:aspect-[3/2] bg-surface-product overflow-hidden rounded-lg">
                <img 
                  :src="categories[1].image"
                  :alt="categories[1].name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div class="absolute inset-0 flex items-end p-2 md:p-3 bg-gradient-to-t from-ink-black/70 via-ink-black/30 to-transparent">
                <div class="text-on-primary">
                  <p class="font-label-caps text-label-caps uppercase mb-0.5 text-xs md:text-sm">{{ categories[1].description }}</p>
                  <h3 class="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md uppercase mb-1 md:mb-2 text-sm md:text-base tracking-wider">{{ categories[1].name }}</h3>
                  <button class="border-2 border-on-primary text-on-primary px-2 md:px-3 py-0.5 md:py-1 font-label-caps text-label-caps uppercase text-xs md:text-sm hover:bg-on-primary hover:text-ink-black transition-all duration-300 tracking-wider">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            <!-- Botas -->
            <div 
              @click="() => goToCategoryPage('botas')"
              class="relative group cursor-pointer"
            >
              <div class="aspect-video md:aspect-[3/2] bg-surface-product overflow-hidden rounded-lg">
                <img 
                  :src="categories[2].image"
                  :alt="categories[2].name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div class="absolute inset-0 flex items-end p-2 md:p-3 bg-gradient-to-t from-ink-black/70 via-ink-black/30 to-transparent">
                <div class="text-on-primary">
                  <p class="font-label-caps text-label-caps uppercase mb-0.5 text-xs md:text-sm">{{ categories[2].description }}</p>
                  <h3 class="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md uppercase mb-1 md:mb-2 text-sm md:text-base tracking-wider">{{ categories[2].name }}</h3>
                  <button class="border-2 border-on-primary text-on-primary px-2 md:px-3 py-0.5 md:py-1 font-label-caps text-label-caps uppercase text-xs md:text-sm hover:bg-on-primary hover:text-ink-black transition-all duration-300 tracking-wider">
                    Buy Now
                  </button>
                </div>
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
