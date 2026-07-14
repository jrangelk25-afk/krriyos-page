<script setup lang="ts">
import { ref } from 'vue'

const showInfo = ref(true)
</script>

<template>
  <div v-if="showInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p class="text-blue-900 text-sm">
      📊 <strong>Gestión de Tallas Activada</strong><br>
      Los productos ahora soportan múltiples tallas con inventario individual. 
      Edita un producto para agregar tallas (33-47 para calzado).
    </p>
  </div>
</template>
