-- Remapear los 2 productos existentes a diferentes categorías reales

-- Actualizar "prueba-1" a la categoría "Apache"
UPDATE products
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Apache'
  LIMIT 1
)
WHERE name = 'prueba-1';

-- Actualizar "prueba-2" a la categoría "Mocasines"
UPDATE products
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Mocasines'
  LIMIT 1
)
WHERE name = 'prueba-2';

-- Verificar que se actualizó correctamente
SELECT 
  p.id,
  p.name as product_name,
  c.name as category_name,
  p.category_id
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.name;
