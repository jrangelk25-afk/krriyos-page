import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '../types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  // Inicializar desde localStorage
  const loadCart = () => {
    try {
      const saved = localStorage.getItem('krriyos_cart')
      if (saved) {
        const data = JSON.parse(saved)
        items.value = data.items || []
      }
    } catch (error) {
      console.error('Error cargando carrito:', error)
    }
  }

  // Persistir en localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('krriyos_cart', JSON.stringify({ items: items.value }))
    } catch (error) {
      console.error('Error guardando carrito:', error)
    }
  }

  // Computar totales
  const totals = computed(() => {
    const subtotal = items.value.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0)

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
    }
  })

  const cartCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.cantidad, 0)
  })

  const hasItems = computed(() => items.value.length > 0)

  // Actions
  const addToCart = (item: CartItem) => {
    // Buscar por producto, talla Y color para crear IDs únicos
    const existingItem = items.value.find(
      (i) => i.productId === item.productId && 
             i.talla === item.talla && 
             i.colorId === item.colorId
    )

    if (existingItem) {
      existingItem.cantidad += item.cantidad
    } else {
      items.value.push(item)
    }

    saveCart()
  }

  const removeFromCart = (cartItemId: string) => {
    items.value = items.value.filter((item) => item.id !== cartItemId)
    saveCart()
  }

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    const item = items.value.find((i) => i.id === cartItemId)
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(cartItemId)
      } else {
        item.cantidad = newQuantity
        saveCart()
      }
    }
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  const toggleDrawer = () => {
    isOpen.value = !isOpen.value
  }

  const closeDrawer = () => {
    isOpen.value = false
  }

  const openDrawer = () => {
    isOpen.value = true
  }

  // Cargar carrito al inicializar
  loadCart()

  return {
    items,
    isOpen,
    totals,
    cartCount,
    hasItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleDrawer,
    closeDrawer,
    openDrawer,
    loadCart,
  }
})
