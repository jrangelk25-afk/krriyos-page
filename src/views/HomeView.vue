<script setup lang="ts">
import { onMounted } from 'vue'
import { useMetaTags } from '../composables/useMeta'
import Hero from '../components/Hero.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import Outlet from '../components/Outlet.vue'
import NewArrivals from '../components/NewArrivals.vue'

// Actualizar meta tags para la home
onMounted(() => {
  useMetaTags({
    title: 'krriyos - Orgullosos de Caminar Contigo',
    description: 'Descubre nuestra colección premium de calzado de alto rendimiento. Sneakers, Urban wear y botas diseñadas para el futuro.',
    image: '/logo.webp',
    url: '/',
    type: 'website',
  })
})
</script>

<template>
  <div class="space-y-0">
    <Hero />
    <CategoryGrid />
    <NewArrivals class="-mt-16" />
    <Outlet class="-mt-16" />
  </div>
</template>
