<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGSAP } from '../composables/useGSAP'
import gsap from 'gsap'
import hero1 from '/hero1.webp?url'
import hero2 from '/hero2.webp?url'
import hero3 from '/hero3.webp?url'

const router = useRouter()
const gsapComposable = useGSAP()

const heroImages = [hero1, hero2, hero3]
const currentImageIndex = ref(0)
const imageOpacity = ref(1)

const changeImage = () => {
  // Fade out
  gsap.to({ opacity: imageOpacity.value }, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.inOut',
    onUpdate: function() {
      imageOpacity.value = this.progress() === 0 ? 1 : 1 - this.progress()
    }
  })

  // Cambiar imagen después del fade out
  setTimeout(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % heroImages.length
    
    // Fade in
    gsap.to({ opacity: 0 }, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut',
      onUpdate: function() {
        imageOpacity.value = this.progress()
      }
    })
  }, 500)
}

onMounted(() => {
  gsapComposable.heroTimeline('.hero-section')
  gsapComposable.parallaxEffect('.hero-image', 0.3)
  
  // Cambiar imagen cada 3 segundos
  setInterval(changeImage, 3000)
})

const goToCatalog = () => {
  router.push('/catalogo')
}
</script>

<template>
  <section class="hero-section relative h-[70vh] md:h-[90vh] w-full overflow-hidden flex items-center">
    <!-- Background Image Carousel -->
    <div class="hero-image absolute inset-0 z-0" :style="{ opacity: imageOpacity }">
      <img 
        :alt="`Hero background ${currentImageIndex + 1}`"
        :key="currentImageIndex"
        class="w-full h-full object-cover grayscale-[0.2]"
        :src="heroImages[currentImageIndex]"
      />
      <div class="absolute inset-0 bg-ink-black/20"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 px-margin-mobile md:px-margin-desktop w-full max-w-7xl mx-auto">
      <div class="max-w-3xl">
        <h1 class="hero-headline font-display-xl text-headline-lg-mobile md:text-display-xl text-on-primary uppercase mb-6 md:mb-8">
          ORGULLOSOS<br/>DE CAMINAR CONTIGO
        </h1>
        
        <p class="hero-description font-body-lg text-body-lg text-on-primary/90 mb-8 md:mb-12 max-w-xl">
          Descubre nuestra colección de sneakers premium, urban wear y botas de alto rendimiento, diseñadas con precisión arquitectónica para el movimiento contemporáneo.
        </p>

        <button 
          @click="goToCatalog"
          class="hero-button bg-ink-black text-on-primary px-8 md:px-12 py-4 md:py-5 font-label-caps text-label-caps uppercase hover:bg-on-primary hover:text-ink-black transition-all duration-300 border-2 border-ink-black"
        >
          Comprar Ahora
        </button>
      </div>
    </div>
  </section>
</template>
