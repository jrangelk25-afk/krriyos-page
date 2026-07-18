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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
  isLoading.value = true
  uiStore.setLoading(true)

  try {
    // Generar número de orden
    const orderNumber = `KRR-${Date.now()}`

    // Preparar datos de la orden para la API
    const orderData = {
      orderNumber,
      fullName: formData.nombre,
      email: formData.email,
      phone: formData.telefono,
      country: formData.pais,
      city: formData.ciudad,
      address: formData.direccion,
      items: cartStore.items.map(item => ({
        productId: item.productId,
        size: item.talla,
        color: item.colorName,
        quantity: item.cantidad,
        unitPrice: item.precioUnitario,
      })),
      subtotal: cartStore.totals.subtotal,
      total: cartStore.totals.total,
    }

    console.log('📤 Sending order:', orderData)

    // Enviar orden a la API
    const response = await fetch('/api/public/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.json()

    console.log('📥 Response status:', response.status)
    console.log('📥 Response data:', result)

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al procesar la orden')
    }

    // Crear objeto de orden para la vista de confirmación
    const order = {
      id: result.data.id,
      orderNumber: result.data.orderNumber,
      fecha: new Date(),
      cliente: formData,
      items: cartStore.items,
      totals: cartStore.totals,
    }

    // Guardar en sessionStorage
    sessionStorage.setItem('krriyos_order', JSON.stringify(order))

    // Limpiar carrito
    cartStore.clearCart()

    // Mostrar notificación
    uiStore.addNotification(
      `¡Compra realizada! Número de orden: ${orderNumber}`,
      'success',
      4000
    )

    // Navegar a confirmación
    setTimeout(() => {
      router.push('/confirmacion')
    }, 500)
  } catch (error) {
    console.error('❌ Error en checkout:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar tu compra. Por favor intenta de nuevo.'
    uiStore.addNotification(
      errorMessage,
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
                class="flex justify-between items-start gap-3 p-3 bg-surface rounded-lg"
              >
                <div class="flex-1 space-y-2">
                  <p class="font-label-caps text-label-caps text-xs text-on-surface-variant">
                    {{ item.producto.sku }}
                  </p>
                  <p class="font-body-md text-body-md text-on-surface">
                    {{ item.producto.nombre }}
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="inline-block bg-surface-dim rounded px-2 py-1">
                      <p class="font-label-sm text-label-sm text-on-surface">Talla {{ item.talla }}</p>
                    </span>
                    <span v-if="item.colorName" class="inline-block bg-surface-dim rounded px-2 py-1">
                      <p class="font-label-sm text-label-sm text-on-surface">{{ item.colorName }}</p>
                    </span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Cantidad: {{ item.cantidad }}
                  </p>
                </div>
                <p class="font-label-caps text-label-caps text-on-surface whitespace-nowrap font-bold">
                  {{ formatCurrency(item.cantidad * item.precioUnitario) }}
                </p>
              </div>
            </div>

            <!-- Totals -->
            <CartSummary :items="cartStore.items" />

            <!-- Info -->
            <p class="font-body-md text-body-md text-on-surface-variant text-sm mt-6 text-center">
              Un asesor se contactará contigo para confirmar la compra y coordinar el envío.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
