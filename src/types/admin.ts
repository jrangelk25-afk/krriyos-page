// Tipos TypeScript para el panel administrativo

// Tipos para productos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  image_url: string;
}

// Tipos para categorías
export interface Category {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
  icon_url?: string;
}

// Tipos para pedidos
export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: Product;
}

// Tipos para clientes
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

// Tipos para usuarios administrativos
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'moderator';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'moderator';
}

// Tipos para logs de auditoría
export interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  created_at: string;
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  orders_this_month: number;
  orders_pending: number;
  new_customers_this_month: number;
  top_products: Product[];
  recent_orders: Order[];
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Tipos para colores y tallas
export interface ProductColor {
  id: string;
  productId: string;
  name: string;
  hexCode: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSize {
  id: string;
  productId: string;
  colorId: string;
  size: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  color?: ProductColor;
}

export interface ProductSizeWithColor extends ProductSize {
  color: ProductColor;
}

// Estructura para tallas organizadas por color
export interface SizesByColor {
  [colorId: string]: {
    color: ProductColor;
    sizes: ProductSize[];
    totalStock: number;
  };
}

// Estructura para colores organizados por talla
export interface ColorsBySize {
  [size: string]: ProductColor[];
}

export interface CreateProductSizeInput {
  size: string;
  colorId: string;
  stock: number;
}

export interface UpdateProductSizeInput {
  stock: number;
}

export interface ProductInventoryStats {
  totalVariants: number;
  totalStock: number;
  colorCount: number;
  sizeCount: number;
  availableSizes: string[];
  availableColors: ProductColor[];
}

// TODO: Agregar más tipos según sea necesario
