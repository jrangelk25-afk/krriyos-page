<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useUIStore } from '../stores/uiStore'
import CheckoutForm from '../components/CheckoutForm.vue'
import CartSummary from '../components/CartSummary.vue'
import type { CheckoutFormData } from '../types'

const router = useRouter()
const cartStore = useCartStore()
const uiStore = useUIStore()
const isLoading = ref(false)

const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
  isLoading.value = true
  uiStore.setLoading(true)

  try {
    // Generar ID de orden
    const orderId = `KRR-${Date.now()}`

    // Simular envío de email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Crear objeto de orden
    const order = {
      id: orderId,
      fecha: new Date(),
      cliente: formData,
      items: cartStore.items,
      totals: cartStore.totals,
    }

    // Guardar en sessionStorage (no localStorage para privacidad)
    sessionStorage.setItem('krriyos_order', JSON.stringify(order))

    // Limpiar carrito
    cartStore.clearCart()

    // Mostrar notificación
    uiStore.addNotification(
      `¡Compra realizada! Número de orden: ${orderId}`,
      'success',
      4000
    )

    // Navegar a confirmación
    setTimeout(() => {
      router.push('/confirmacion')
    }, 500)
  } catch (error) {
    console.error('Error en checkout:', error)
    uiStore.addNotification(
      'Error al procesar tu compra. Por favor intenta de nuevo.',
      'error',
      3000
    )
  } finally {
    isLoading.value = false
    uiStore.setLoading(false)
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-background">
    <div class="px-margin-mobile md:px-margin-desktop py-12 max-w-7xl mx-auto">
      <h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface uppercase mb-12">
        Checkout
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Form Section (2 cols) -->
        <div class="md:col-span-2">
          <CheckoutForm @submit="handleCheckoutSubmit" />
        </div>

        <!-- Summary Section (1 col) -->
        <div class="md:col-span-1">
          <div class="sticky top-24 bg-surface-container p-6 rounded-lg">
            <h2 class="font-headline-md text-headline-md uppercase text-on-surface mb-6">
              Resumen de Orden
            </h2>

            <!-- Items -->
            <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
              <div 
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex justify-between items-start gap-3"
              >
                <div class="flex-1">
                  <p class="font-label-caps text-label-caps text-sm text-on-surface">
                    {{ item.producto.sku }}
                  </p>
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Talla: {{ item.talla }}
                  </p>
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    × {{ item.cantidad }}
                  </p>
                </div>
                <p class="font-label-caps text-label-caps text-on-surface whitespace-nowrap">
                  ${{ (item.cantidad * item.precioUnitario).toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Totals -->
            <CartSummary :items="cartStore.items" />

            <!-- Info -->
            <p class="font-body-md text-body-md text-on-surface-variant text-sm mt-6 text-center">
              Se enviará una confirmación a tu correo electrónico una vez completada la compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
