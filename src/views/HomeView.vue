<script setup lang="ts">
import Hero from '../components/Hero.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import Outlet from '../components/Outlet.vue'
import NewArrivals from '../components/NewArrivals.vue'
</script>

<template>
  <div class="space-y-0">
    <Hero />
    <CategoryGrid />
    <NewArrivals class="-mt-16" />
    <Outlet class="-mt-16" />
  </div>
</template>
