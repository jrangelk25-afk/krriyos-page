<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Order } from '../types'

const router = useRouter()
const order = ref<Order | null>(null)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(() => {
  const orderData = sessionStorage.getItem('krriyos_order')
  if (orderData) {
    try {
      order.value = JSON.parse(orderData)
    } catch (error) {
      console.error('Error loading order:', error)
      router.push('/catalogo')
    }
  } else {
    router.push('/catalogo')
  }
})

const continueShopping = () => {
  sessionStorage.removeItem('krriyos_order')
  router.push('/')
}
</script>

<template>
  <div v-if="order" class="min-h-[calc(100vh-80px)] bg-background flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop">
    <div class="max-w-2xl w-full text-center">
      <!-- Success Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <span class="material-symbols-outlined text-4xl text-green-600">check_circle</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface uppercase mb-4">
        ¡Gracias por tu Compra!
      </h1>

      <!-- Order Number -->
      <div class="bg-surface-container p-6 rounded-lg mb-8">
        <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">
          Número de Orden
        </p>
        <p class="font-display-xl text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          {{ order.id }}
        </p>
      </div>

      <!-- Order Details -->
      <div class="bg-surface-container-low p-6 rounded-lg mb-8 text-left">
        <h2 class="font-headline-md text-headline-md text-on-surface uppercase mb-4">
          Detalle de Orden
        </h2>

        <!-- Customer Info -->
        <div class="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-outline-variant">
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Nombre</p>
            <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.nombre }}</p>
          </div>
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Email</p>
            <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.email }}</p>
          </div>
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Teléfono</p>
            <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.telefono }}</p>
          </div>
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">Ciudad</p>
            <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.ciudad }}</p>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="mb-6 pb-6 border-b border-outline-variant">
          <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Dirección de Envío</p>
          <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.direccion }}</p>
          <p class="font-body-md text-body-md text-on-surface">{{ order.cliente.ciudad }}, {{ order.cliente.pais }}</p>
        </div>

        <!-- Items -->
        <div class="mb-6">
          <h3 class="font-headline-md text-headline-md text-on-surface uppercase mb-4">Productos</h3>
          <div class="space-y-3">
            <div 
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between items-start pb-3 border-b border-outline-variant last:border-b-0"
            >
              <div>
                <p class="font-label-caps text-label-caps text-on-surface">{{ item.producto.sku }} {{ item.producto.nombre }}</p>
                <p class="font-body-md text-body-md text-on-surface-variant text-sm">
                  Talla {{ item.talla }} × {{ item.cantidad }}
                </p>
              </div>
              <p class="font-label-caps text-label-caps text-on-surface">
                {{ formatCurrency(item.cantidad * item.precioUnitario) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="space-y-2 mb-6 pb-6 border-b border-outline-variant">
          <div class="flex justify-between">
            <p class="font-body-md text-body-md text-on-surface-variant">Subtotal</p>
            <p class="font-body-md text-body-md text-on-surface">{{ formatCurrency(order.totals.subtotal) }}</p>
          </div>
          <div class="flex justify-between">
            <p class="font-body-md text-body-md text-on-surface-variant">Impuesto (19%)</p>
            <p class="font-body-md text-body-md text-on-surface">{{ formatCurrency(order.totals.tax) }}</p>
          </div>
          <div class="flex justify-between items-center bg-primary/10 p-3 rounded">
            <p class="font-headline-md text-headline-md text-on-surface">Total</p>
            <p class="font-headline-md text-headline-md text-primary">{{ formatCurrency(order.totals.total) }}</p>
          </div>
        </div>
      </div>

      <!-- Message -->
      <p class="font-body-lg text-body-lg text-on-surface-variant mb-8">
        Se ha enviado una confirmación detallada a tu correo electrónico. 
        <br/>Rastrearemos tu orden y te notificaremos sobre el estado del envío.
      </p>

      <!-- Continue Shopping Button -->
      <button 
        @click="continueShopping"
        class="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity"
      >
        Continuar Comprando
      </button>
    </div>
  </div>

  <div v-else class="min-h-[calc(100vh-80px)] flex items-center justify-center">
    <p class="font-body-lg text-body-lg text-on-surface-variant">
      Cargando orden...
    </p>
  </div>
</template>
