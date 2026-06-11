<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const socialLinks = {
  instagram: 'https://www.instagram.com/krriyos.k/',
  facebook: '',
  twitter: '',
  tiktok: ''
}

const openSocial = (platform: string) => {
  const url = socialLinks[platform as keyof typeof socialLinks]
  if (url) {
    window.open(url, '_blank')
    isOpen.value = false
  }
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="fixed bottom-8 right-8 z-40">
    <!-- Menu de redes sociales -->
    <transition name="fade">
      <div v-if="isOpen" class="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
        <!-- Instagram -->
        <button
          v-if="socialLinks.instagram"
          @click="openSocial('instagram')"
          class="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all transform hover:scale-110"
          title="Instagram"
          aria-label="Seguir en Instagram"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 7.558c.011.162.011.326.011.491 0 4.96-3.775 10.682-10.682 10.682-2.121 0-4.093-.619-5.755-1.688.294.035.592.053.894.053 1.759 0 3.379-.597 4.664-1.6-1.641-.03-3.022-1.113-3.498-2.598.229.044.465.067.708.067.342 0 .675-.045.992-.129-1.716-.345-3.008-1.859-3.008-3.676v-.046c.505.281 1.084.449 1.704.471-.1-.067-.201-.135-.296-.206a3.68 3.68 0 0 1-.67-.868 3.685 3.685 0 0 1-.46-1.08c0-1.127.574-2.124 1.443-2.697-.109.003-.217.009-.324.009-1.035 0-2.011.32-2.835.872a3.678 3.678 0 0 0-1.18 1.794 3.68 3.68 0 0 0-.237 1.46c0 2.609 2.122 4.725 4.733 4.725.014 0 .027 0 .041 0 1.641-.067 3.185-.497 4.51-1.25-.334.871-1.079 1.602-2.014 1.975 1.036.231 2.118.116 3.12-.343 1.035-.481 1.923-1.289 2.481-2.299-.37.935-.989 1.783-1.814 2.482.935-.1 1.837-.341 2.685-.705z"/>
          </svg>
        </button>

        <!-- Facebook -->
        <button
          v-if="socialLinks.facebook"
          @click="openSocial('facebook')"
          class="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all transform hover:scale-110 opacity-50 cursor-not-allowed"
          title="Facebook (próximamente)"
          aria-label="Facebook"
          disabled
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        <!-- Twitter -->
        <button
          v-if="socialLinks.twitter"
          @click="openSocial('twitter')"
          class="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all transform hover:scale-110 opacity-50 cursor-not-allowed"
          title="Twitter (próximamente)"
          aria-label="Twitter"
          disabled
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 002.856-3.513 9.958 9.958 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>

        <!-- TikTok -->
        <button
          v-if="socialLinks.tiktok"
          @click="openSocial('tiktok')"
          class="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all transform hover:scale-110 opacity-50 cursor-not-allowed"
          title="TikTok (próximamente)"
          aria-label="TikTok"
          disabled
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.66 1.94 2.89 2.89 0 015.66-1.93V9.01a8.41 8.41 0 00-7.56 4.07 8.35 8.35 0 0013.6 2.7V9.27a11.86 11.86 0 003.39.29v-3.61c-1.25.06-2.29.02-3.59-.02Z"/>
          </svg>
        </button>
      </div>
    </transition>

    <!-- Botón principal flotante -->
    <button
      @click="toggleMenu"
      class="w-14 h-14 bg-ink-black text-on-primary rounded-full flex items-center justify-center hover:bg-secondary hover:text-ink-black transition-all shadow-lg hover:shadow-xl transform hover:scale-110 relative"
      :class="{ 'bg-secondary text-ink-black': isOpen }"
      title="Síguenos en Instagram"
      aria-label="Abrir menú de redes sociales"
    >
      <svg 
        v-if="!isOpen"
        class="w-7 h-7" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 7.558c.011.162.011.326.011.491 0 4.96-3.775 10.682-10.682 10.682-2.121 0-4.093-.619-5.755-1.688.294.035.592.053.894.053 1.759 0 3.379-.597 4.664-1.6-1.641-.03-3.022-1.113-3.498-2.598.229.044.465.067.708.067.342 0 .675-.045.992-.129-1.716-.345-3.008-1.859-3.008-3.676v-.046c.505.281 1.084.449 1.704.471-.1-.067-.201-.135-.296-.206a3.68 3.68 0 0 1-.67-.868 3.685 3.685 0 0 1-.46-1.08c0-1.127.574-2.124 1.443-2.697-.109.003-.217.009-.324.009-1.035 0-2.011.32-2.835.872a3.678 3.678 0 0 0-1.18 1.794 3.68 3.68 0 0 0-.237 1.46c0 2.609 2.122 4.725 4.733 4.725.014 0 .027 0 .041 0 1.641-.067 3.185-.497 4.51-1.25-.334.871-1.079 1.602-2.014 1.975 1.036.231 2.118.116 3.12-.343 1.035-.481 1.923-1.289 2.481-2.299-.37.935-.989 1.783-1.814 2.482.935-.1 1.837-.341 2.685-.705z"/>
      </svg>
      <svg 
        v-else
        class="w-7 h-7" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
