-- CreateIndex - Índices para optimizar queries comunes

-- Índice compuesto para búsqueda de productos por categoría, estado activo y outlet
CREATE INDEX idx_products_category_active_outlet 
  ON products(category_id, is_active, is_outlet);

-- Índice para búsqueda de productos por SKU
CREATE INDEX idx_products_sku 
  ON products(sku);

-- Índice compuesto para búsqueda de órdenes por estado y fecha
CREATE INDEX idx_orders_status_created 
  ON orders(status, created_at DESC);

-- Índice para búsqueda de clientes por email
CREATE INDEX idx_customers_email 
  ON customers(email);

-- Índice para relación de items de órdenes con productos
CREATE INDEX idx_order_items_product 
  ON order_items(product_id);

-- Índice para búsqueda de usuarios admin por email
CREATE INDEX idx_admin_users_email 
  ON admin_users(email);

-- Índice compuesto para búsqueda de audit logs por usuario admin y fecha
CREATE INDEX idx_audit_logs_admin_created 
  ON audit_log(admin_user_id, created_at DESC);

-- Índice para relación de colores con productos
CREATE INDEX idx_product_colors_product 
  ON product_colors(product_id);

-- Índice para relación de tallas con productos
CREATE INDEX idx_product_sizes_product 
  ON product_sizes(product_id);

-- Índice para relación de imágenes con productos
CREATE INDEX idx_product_images_product 
  ON product_images(product_id);

-- Índice para relación de size-color mappings
CREATE INDEX idx_product_size_color_size 
  ON product_size_colors(size_id);

CREATE INDEX idx_product_size_color_color 
  ON product_size_colors(color_id);

-- Índice para búsqueda de categorías activas
CREATE INDEX idx_categories_active 
  ON categories(is_active);

-- Índice compuesto para búsqueda de productos por categoría y estado activo
CREATE INDEX idx_products_category_active 
  ON products(category_id, is_active);
