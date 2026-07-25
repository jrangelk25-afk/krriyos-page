<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import hero1 from '/hero1.webp?url'
import hero2 from '/hero2.webp?url'
import hero3 from '/hero3.webp?url'

const router = useRouter()

const heroImages = [hero1, hero2, hero3]
const currentImageIndex = ref(0)
let imageChangeInterval: NodeJS.Timeout | null = null

const changeImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % heroImages.length
}

onMounted(() => {
  // Cambiar imagen cada 3 segundos
  imageChangeInterval = setInterval(changeImage, 3000)
})

onUnmounted(() => {
  if (imageChangeInterval) {
    clearInterval(imageChangeInterval)
  }
})

const goToCatalog = () => {
  router.push('/catalogo')
}
</script>

<template>
  <section class="hero-section relative h-[70vh] md:h-[90vh] w-full overflow-hidden flex items-center">
    <!-- Background Image Carousel with CSS transitions -->
    <div 
      class="hero-image absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-500"
      :key="currentImageIndex"
    >
      <img 
        :alt="`Hero background ${currentImageIndex + 1}`"
        class="w-full h-full object-cover grayscale-[0.2] animate-fadeIn"
        style="object-position: center 60%"
        :src="heroImages[currentImageIndex]"
      />
      <div class="absolute inset-0 bg-ink-black/20"></div>
    </div>

    <!-- Content with fade-in animation -->
    <div class="relative z-10 px-margin-mobile md:px-margin-desktop w-full flex justify-end animate-fadeIn">
      <div class="max-w-3xl text-right pr-0">
        <h1 class="hero-headline font-display-xl text-headline-lg-mobile md:text-display-xl text-on-primary uppercase mb-6 md:mb-8 animate-slideInUp">
          ORGULLOSOS<br/>DE CAMINAR CONTIGO
        </h1>
        
        <p class="hero-description font-body-lg text-body-lg text-on-primary/90 mb-8 md:mb-12 max-w-xl animate-slideInUp [animation-delay:100ms]">
          Descubre nuestra colección de mocasines, sneakers, apache, botas, entre otras; diseñadas con precisión arquitectónica para el movimiento contemporáneo.
        </p>

        <button 
          @click="goToCatalog"
          class="hero-button bg-ink-black text-on-primary px-8 md:px-12 py-4 md:py-5 font-label-caps text-label-caps uppercase hover:bg-on-primary hover:text-ink-black transition-all duration-300 border-2 border-ink-black animate-slideInUp [animation-delay:200ms]"
        >
          Ver Ahora
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-in-out forwards;
}

.animate-slideInUp {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
}
</style>
