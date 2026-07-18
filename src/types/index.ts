// Size Inventory types
export interface ProductSizeInventory {
  id: string
  size: string
  colorId?: string
  colorName?: string
  colorIds?: string[]
  quantity: number
}

// Product types
export interface Product {
  id: string
  sku: string
  nombre: string
  descripcion: string
  precio: number
  imagenes: string[]
  categoria: string
  categoryId?: string
  tallas: string[]
  sizes?: ProductSizeInventory[]
  stock: number
  isNewArrival?: boolean
  isOutlet?: boolean
  createdAt?: Date
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  producto: Product
  cantidad: number
  talla: string
  colorId?: string
  colorName?: string
  precioUnitario: number
}

export interface CartState {
  items: CartItem[]
  totals: {
    subtotal: number
    total: number
  }
  isOpen: boolean
}

// Checkout types
export interface CheckoutFormData {
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  pais: string
  metodoPago?: string
}

// Order types
export interface Order {
  id: string
  orderNumber?: string
  fecha: Date
  cliente: CheckoutFormData
  items: CartItem[]
  totals: CartState['totals']
}

// Filters and UI types
export interface ProductFilters {
  categoryId?: string
  sortBy?: 'nombre' | 'precio-asc' | 'precio-desc' | 'nuevo'
  searchQuery?: string
}

export interface UINotification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}
