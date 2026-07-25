import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')

console.log('Loading env from:', envPath)
dotenv.config({ path: envPath })

const { Client } = pg

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in .env')
  process.exit(1)
}

console.log('🔗 Connecting to database...')

const client = new Client({
  connectionString: connectionString,
})

const migrationSQL = `
-- CreateIndex - Índices para optimizar queries comunes

-- Índice compuesto para búsqueda de productos por categoría, estado activo y outlet
CREATE INDEX IF NOT EXISTS idx_products_category_active_outlet 
  ON products(category_id, is_active, is_outlet);

-- Índice para búsqueda de productos por SKU
CREATE INDEX IF NOT EXISTS idx_products_sku 
  ON products(sku);

-- Índice compuesto para búsqueda de órdenes por estado y fecha
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at DESC);

-- Índice para búsqueda de clientes por email
CREATE INDEX IF NOT EXISTS idx_customers_email 
  ON customers(email);

-- Índice para relación de items de órdenes con productos
CREATE INDEX IF NOT EXISTS idx_order_items_product 
  ON order_items(product_id);

-- Índice para búsqueda de usuarios admin por email
CREATE INDEX IF NOT EXISTS idx_admin_users_email 
  ON admin_users(email);

-- Índice compuesto para búsqueda de audit logs por usuario admin y fecha
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_created 
  ON audit_log(admin_user_id, created_at DESC);

-- Índice para relación de colores con productos
CREATE INDEX IF NOT EXISTS idx_product_colors_product 
  ON product_colors(product_id);

-- Índice para relación de tallas con productos
CREATE INDEX IF NOT EXISTS idx_product_sizes_product 
  ON product_sizes(product_id);

-- Índice para relación de imágenes con productos
CREATE INDEX IF NOT EXISTS idx_product_images_product 
  ON product_images(product_id);

-- Índice para relación de size-color mappings
CREATE INDEX IF NOT EXISTS idx_product_size_color_size 
  ON product_size_colors(size_id);

CREATE INDEX IF NOT EXISTS idx_product_size_color_color 
  ON product_size_colors(color_id);

-- Índice para búsqueda de categorías activas
CREATE INDEX IF NOT EXISTS idx_categories_active 
  ON categories(is_active);

-- Índice compuesto para búsqueda de productos por categoría y estado activo
CREATE INDEX IF NOT EXISTS idx_products_category_active 
  ON products(category_id, is_active);
`

async function runMigration() {
  try {
    await client.connect()
    console.log('✅ Connected to database')

    console.log('\n⏳ Running migration...')
    await client.query(migrationSQL)
    console.log('✅ Migration completed successfully!')

    // Verificar que los índices fueron creados
    const result = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename IN ('products', 'orders', 'customers', 'order_items', 'admin_users', 'audit_log', 'product_colors', 'product_sizes', 'product_images', 'product_size_colors', 'categories')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `)

    console.log('\n📊 Created indexes:')
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.indexname}`)
    })
    console.log(`\n✅ Total: ${result.rows.length} indexes created`)

    await client.end()
    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()
