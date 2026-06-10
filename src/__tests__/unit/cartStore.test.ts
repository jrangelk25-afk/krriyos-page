import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../../stores/cartStore'
import type { CartItem, Product } from '../../types'

describe('cartStore (Pinia)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockProduct: Product = {
    id: 'test-1',
    sku: 'KRR-TEST',
    nombre: 'Test Product',
    descripcion: 'Test Description',
    precio: 99.99,
    imagenes: ['test.jpg'],
    categoria: 'Sneakers',
    tallas: ['36', '37'],
    stock: 10,
    isNewArrival: false
  }

  describe('state initialization', () => {
    it('should initialize with empty cart', () => {
      const store = useCartStore()
      expect(store.items).toEqual([])
      expect(store.totals.subtotal).toBe(0)
      expect(store.totals.total).toBe(0)
    })

    it('should initialize isOpen as false', () => {
      const store = useCartStore()
      expect(store.isOpen).toBe(false)
    })
  })

  describe('addToCart action', () => {
    it('should add item to cart', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 99.99
      }
      store.addToCart(item)
      expect(store.items).toHaveLength(1)
      expect(store.items[0]).toEqual(item)
    })

    it('should increment quantity if item already exists', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 99.99
      }
      store.addToCart(item)
      store.addToCart(item)
      expect(store.items).toHaveLength(1)
      expect(store.items[0].cantidad).toBe(2)
    })

    it('should update totals after adding', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 2,
        talla: '36',
        precioUnitario: 100
      }
      store.addToCart(item)
      expect(store.totals.subtotal).toBe(200)
      expect(store.totals.tax).toBe(38) // 200 * 0.19
      expect(store.totals.total).toBe(238)
    })
  })

  describe('removeFromCart action', () => {
    it('should remove item from cart', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 99.99
      }
      store.addToCart(item)
      expect(store.items).toHaveLength(1)
      store.removeFromCart('item-1')
      expect(store.items).toHaveLength(0)
    })

    it('should update totals after removing', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 2,
        talla: '36',
        precioUnitario: 100
      }
      store.addToCart(item)
      store.removeFromCart('item-1')
      expect(store.totals.subtotal).toBe(0)
      expect(store.totals.total).toBe(0)
    })
  })

  describe('updateQuantity action', () => {
    it('should update item quantity', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 100
      }
      store.addToCart(item)
      store.updateQuantity('item-1', 5)
      expect(store.items[0].cantidad).toBe(5)
    })

    it('should recalculate totals on quantity update', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 100
      }
      store.addToCart(item)
      store.updateQuantity('item-1', 3)
      expect(store.totals.subtotal).toBe(300)
      expect(store.totals.total).toBe(357) // 300 + (300 * 0.19)
    })
  })

  describe('clearCart action', () => {
    it('should clear all items', () => {
      const store = useCartStore()
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 99.99
      }
      store.addToCart(item)
      store.clearCart()
      expect(store.items).toHaveLength(0)
      expect(store.totals.subtotal).toBe(0)
    })
  })

  describe('toggleDrawer action', () => {
    it('should toggle cart drawer state', () => {
      const store = useCartStore()
      expect(store.isOpen).toBe(false)
      store.toggleDrawer()
      expect(store.isOpen).toBe(true)
      store.toggleDrawer()
      expect(store.isOpen).toBe(false)
    })
  })

  describe('getters', () => {
    it('should calculate cartCount correctly', () => {
      const store = useCartStore()
      const item1: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 2,
        talla: '36',
        precioUnitario: 100
      }
      const item2: CartItem = {
        ...item1,
        id: 'item-2',
        cantidad: 3,
        talla: '37'
      }
      store.addToCart(item1)
      store.addToCart(item2)
      expect(store.cartCount).toBe(5) // 2 + 3
    })

    it('should indicate hasItems correctly', () => {
      const store = useCartStore()
      expect(store.hasItems).toBe(false)
      const item: CartItem = {
        id: 'item-1',
        productId: mockProduct.id,
        producto: mockProduct,
        cantidad: 1,
        talla: '36',
        precioUnitario: 100
      }
      store.addToCart(item)
      expect(store.hasItems).toBe(true)
    })
  })
})
