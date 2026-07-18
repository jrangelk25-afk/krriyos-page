<script setup lang="ts">
import { watch, ref } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useRouter } from 'vue-router'
import CartItem from './CartItem.vue'
import CartSummary from './CartSummary.vue'

const cartStore = useCartStore()
const router = useRouter()
const drawerEl = ref<HTMLElement | null>(null)

watch(() => cartStore.isOpen, (isOpen) => {
  if (isOpen && drawerEl.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})

const closeDrawer = () => {
  cartStore.closeDrawer()
}

const handleOverlayClick = () => {
  closeDrawer()
}

const handleIncrement = (cartItemId: string) => {
  const item = cartStore.items.find(i => i.id === cartItemId)
  if (item) {
    cartStore.updateQuantity(cartItemId, item.cantidad + 1)
  }
}

const handleDecrement = (cartItemId: string) => {
  const item = cartStore.items.find(i => i.id === cartItemId)
  if (item && item.cantidad > 1) {
    cartStore.updateQuantity(cartItemId, item.cantidad - 1)
  }
}

const handleCheckout = () => {
  closeDrawer()
  router.push('/checkout')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <!-- Overlay -->
  <div 
    v-if="cartStore.isOpen"
    @click="handleOverlayClick"
    class="fixed inset-0 bg-ink-black/30 z-30 transition-opacity duration-300"
  />

  <!-- Drawer -->
  <div 
    ref="drawerEl"
    :class="[
      'fixed top-20 right-0 h-[calc(100vh-80px)] w-full sm:w-96 bg-surface z-40 flex flex-col transition-transform duration-300 shadow-xl',
      cartStore.isOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <!-- Header -->
    <div class="border-b border-outline-variant px-3 py-2 flex justify-between items-center flex-shrink-0">
      <h2 class="font-headline-md text-headline-md text-on-surface text-sm">Tu Carrito</h2>
      <button 
        @click="closeDrawer"
        class="text-on-surface hover:opacity-70 transition-opacity p-0.5"
      >
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Items Container with scroll -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="cartStore.items.length === 0" class="h-full flex items-center justify-center px-2 py-4">
        <div class="text-center">
          <p class="font-body-md text-body-md text-on-surface-variant mb-4 text-xs">
            Tu carrito está vacío
          </p>
          <button 
            @click="closeDrawer"
            class="text-primary font-label-caps text-label-caps uppercase hover:opacity-80 transition-opacity text-xs"
          >
            Continuar Comprando
          </button>
        </div>
      </div>

      <div v-else class="space-y-1 px-2 py-2">
        <CartItem 
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
          @increment="() => handleIncrement(item.id)"
          @decrement="() => handleDecrement(item.id)"
          @remove="() => cartStore.removeFromCart(item.id)"
        />
      </div>
    </div>

    <!-- Summary and Checkout - Sticky at bottom -->
    <div v-if="cartStore.items.length > 0" class="border-t border-outline-variant px-2 py-2 flex-shrink-0 bg-surface sticky bottom-0">
      <!-- Quick summary inline -->
      <div class="flex justify-between items-center mb-1.5 text-xs">
        <span class="text-on-surface-variant">{{ cartStore.items.length }} art.</span>
        <span class="font-semibold text-on-surface">{{ formatCurrency(cartStore.items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0)) }}</span>
      </div>
      
      <button 
        @click="handleCheckout"
        class="w-full bg-primary text-on-primary px-3 py-2 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity text-xs rounded font-semibold"
      >
        Checkout
      </button>
    </div>
  </div>
</template>
