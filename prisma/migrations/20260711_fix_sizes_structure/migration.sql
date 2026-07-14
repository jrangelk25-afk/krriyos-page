-- Verificar y correguir la estructura de product_sizes
-- Esta migración asegura que la tabla esté correctamente configurada

-- 1. Asegurar que la tabla existe con la estructura correcta
CREATE TABLE IF NOT EXISTS product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID REFERENCES product_colors(id) ON DELETE SET NULL,
    size VARCHAR(10) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_color_id ON product_sizes(color_id);

-- 3. Crear restricción única para evitar duplicados
-- Primero eliminar si existe
ALTER TABLE product_sizes DROP CONSTRAINT IF EXISTS product_sizes_product_id_size_color_id_key;

-- Luego crear la nueva
ALTER TABLE product_sizes
ADD CONSTRAINT product_sizes_product_id_size_color_id_key 
UNIQUE (product_id, size, color_id);

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_product_sizes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_product_sizes_updated_at ON product_sizes;
CREATE TRIGGER trigger_update_product_sizes_updated_at
    BEFORE UPDATE ON product_sizes
    FOR EACH ROW
    EXECUTE FUNCTION update_product_sizes_updated_at();
