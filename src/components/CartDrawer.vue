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
      'fixed top-20 right-0 h-[calc(100vh-80px)] w-full md:w-96 bg-surface z-40 flex flex-col transition-transform duration-300 shadow-xl',
      cartStore.isOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <!-- Header -->
    <div class="border-b border-outline-variant p-4 flex justify-between items-center">
      <h2 class="font-headline-md text-headline-md text-on-surface">Tu Carrito</h2>
      <button 
        @click="closeDrawer"
        class="text-on-surface hover:opacity-70 transition-opacity"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <!-- Items Container -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="cartStore.items.length === 0" class="h-full flex items-center justify-center">
        <div class="text-center">
          <p class="font-body-md text-body-md text-on-surface-variant mb-4">
            Tu carrito está vacío
          </p>
          <button 
            @click="closeDrawer"
            class="text-primary font-label-caps text-label-caps uppercase hover:opacity-80 transition-opacity"
          >
            Continuar Comprando
          </button>
        </div>
      </div>

      <div v-else class="space-y-4">
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

    <!-- Summary and Checkout -->
    <div v-if="cartStore.items.length > 0" class="border-t border-outline-variant p-4">
      <CartSummary :items="cartStore.items" />
      
      <button 
        @click="handleCheckout"
        class="w-full mt-6 bg-primary text-on-primary px-6 py-4 font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity"
      >
        Proceder al Checkout
      </button>
    </div>
  </div>
</template>
