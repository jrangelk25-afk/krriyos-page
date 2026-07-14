-- Fix display_order and is_primary for existing product images
-- This ensures that images have the correct display order and primary flag

-- For each product, order images by created_at and assign display_order
-- Also set the first image as primary
WITH image_ordering AS (
  SELECT 
    id,
    product_id,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at ASC) as row_num
  FROM product_images
)
UPDATE product_images
SET 
  display_order = (
    SELECT row_num - 1 FROM image_ordering WHERE image_ordering.id = product_images.id
  ),
  is_primary = (
    SELECT row_num = 1 FROM image_ordering WHERE image_ordering.id = product_images.id
  )
WHERE id IN (SELECT id FROM image_ordering);
