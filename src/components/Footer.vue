<script setup lang="ts">
const socialLinks = {
  whatsapp: 'https://wa.me/573023349001?text=Hola%20Krriyos%21%20Me%20interesa%20conocer%20m%C3%A1s%20sobre%20tus%20productos',
  instagram: 'https://www.instagram.com/krriyos.k/',
  tiktok: 'https://vt.tiktok.com/ZSQvXMVXc/',
  facebook: '',
  twitter: '',
}

const openSocial = (platform: string) => {
  const url = socialLinks[platform as keyof typeof socialLinks]
  if (url) {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <footer class="bg-surface-container border-t border-outline-variant py-24 px-margin-mobile md:px-margin-desktop">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start w-full max-w-7xl mx-auto">
      <!-- Branding -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <img 
            alt="krriyos logo" 
            class="h-12 object-contain" 
            src="/logo.webp"
          />
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Marca colombiana de calzado artesanal que fusiona tradición, diseño y calidad. Creado en Piedecuesta por manos expertas, ofreciendo productos únicos, cómodos y duraderos: Hechos en Colombia. Hechos con Orgullo.</p>
        <!-- Social Links -->
        <div class="flex gap-4 mt-6">
          <button
            v-if="socialLinks.whatsapp"
            @click="openSocial('whatsapp')"
            class="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all"
            title="WhatsApp: +57 3023349001"
            aria-label="Contactar por WhatsApp"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M380.9 97.1C335 51.2 273.5 32 208 32c-70.3 0-137.6 27.5-187.6 77.4-50 50-77.1 116.6-77.1 187.6 0 37 9.2 72.5 26.9 104.4l-28.7 104.5 107-28.6c30.6 16.5 65.7 25.3 102.4 25.3h.1c70.3 0 137.6-27.5 187.6-77.4 50-50 77-116.5 77-187.6 0-70.3-27.4-137.6-77.1-187.6zM208 424c-33.1 0-65.7-8.2-94.5-23.8l-6.8-3.6-70.4 18.7 19-69.2-4.5-7c-16.5-26.8-25.3-57.6-25.3-89.9 0-116.7 95-211.7 211.7-211.7 56.5 0 109.6 22 149.5 62s62 93 62 149.5c0 116.7-95 211.7-211.7 211.7zm88.5-60.7c-48.6-24.3-78.6-40-92.7-50.6-32.2 20.3-74.3 33.5-119.2 33.5-11.3 0-22.5-1.1-33.4-3.3 36.1-6.4 72.4-20.3 103.3-40.5 38.5-25.1 71.5-58.1 97-96.9 10.1 8 27.1 20.9 40.9 32 26.4 21.8 49.2 40.8 57.4 49.4-4.7 4.6-11.5 8-19.2 9.8z"/>
            </svg>
          </button>
          <button
            v-if="socialLinks.instagram"
            @click="openSocial('instagram')"
            class="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all"
            title="Instagram"
            aria-label="Seguir en Instagram"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12.1 27-27 27s-27-12.1-27-27 12.1-27 27-27 27 12.1 27 27zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          </button>
          <button
            v-if="socialLinks.tiktok"
            @click="openSocial('tiktok')"
            class="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all"
            title="TikTok"
            aria-label="Seguir en TikTok"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M448,209.91a210.06,210.06,0,0,1-122.77-37.25V349.38A162.55,162.55,0,1,1,185,188.31V278.85a74.62,74.62,0,1,0,52.23,50.85V0h47a178.29,178.29,0,0,0,5.7,36.82A221.84,221.84,0,0,0,448,109.58V209.91Z"/>
            </svg>
          </button>
          <button
            v-if="socialLinks.facebook"
            @click="openSocial('facebook')"
            class="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all opacity-50 cursor-not-allowed"
            title="Facebook (próximamente)"
            aria-label="Facebook"
            disabled
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.89 0-40.5 19.12-40.5 38.7V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"/>
            </svg>
          </button>
          <button
            v-if="socialLinks.twitter"
            @click="openSocial('twitter')"
            class="w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all opacity-50 cursor-not-allowed"
            title="Twitter (próximamente)"
            aria-label="Twitter"
            disabled
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
              <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L289.9 196.1 403.4 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-2 gap-gutter">
        <div class="flex flex-col gap-4">
          <h4 class="font-label-caps text-label-caps uppercase font-bold text-on-surface">Servicio</h4>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Envíos</a>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Contacto</a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="flex flex-col gap-6 md:items-end">
        <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">
          © 2026 Krriyos. Calzado Artesanal.
        </p>
        <div class="flex gap-4">
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">VISA</span>
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">MC</span>
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">ADDI</span>
        </div>
      </div>
    </div>
  </footer>
</template>
