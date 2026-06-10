// Product types
export interface Product {
  id: string
  sku: string
  nombre: string
  descripcion: string
  precio: number
  imagenes: string[]
  categoria: 'Sneakers' | 'Urban' | 'Botas'
  tallas: string[]
  stock: number
  isNewArrival?: boolean
  createdAt?: Date
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  producto: Product
  cantidad: number
  talla: string
  precioUnitario: number
}

export interface CartState {
  items: CartItem[]
  totals: {
    subtotal: number
    tax: number
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
  fecha: Date
  cliente: CheckoutFormData
  items: CartItem[]
  totals: CartState['totals']
}

// Filters and UI types
export interface ProductFilters {
  categoria?: string
  sortBy?: 'nombre' | 'precio-asc' | 'precio-desc' | 'nuevo'
  searchQuery?: string
}

export interface UINotification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}
