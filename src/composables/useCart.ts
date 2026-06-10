import { useCartStore } from '../stores/cartStore'
import { useUIStore } from '../stores/uiStore'
import type { Product, CartItem } from '../types'

export const useCart = () => {
  const cartStore = useCartStore()
  const uiStore = useUIStore()

  const addToCart = (product: Product, quantity: number = 1, talla: string) => {
    if (!talla) {
      uiStore.addNotification(
        'Por favor selecciona una talla',
        'error',
        2000
      )
      return false
    }

    if (product.stock <= 0) {
      uiStore.addNotification(
        'Este producto no está disponible',
        'error',
        2000
      )
      return false
    }

    const cartItemId = `${product.id}-${talla}`
    const cartItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      producto: product,
      cantidad: quantity,
      talla,
      precioUnitario: product.precio,
    }

    cartStore.addToCart(cartItem)
    uiStore.addNotification(
      `${product.nombre} agregado al carrito`,
      'success',
      2000
    )
    return true
  }

  const removeFromCart = (cartItemId: string) => {
    cartStore.removeFromCart(cartItemId)
    uiStore.addNotification(
      'Producto eliminado del carrito',
      'info',
      2000
    )
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    cartStore.updateQuantity(cartItemId, quantity)
  }

  const clearCart = () => {
    cartStore.clearCart()
  }

  const getCartTotal = () => {
    return cartStore.totals
  }

  const getCartCount = () => {
    return cartStore.cartCount
  }

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    cartItems: cartStore.items,
  }
}
