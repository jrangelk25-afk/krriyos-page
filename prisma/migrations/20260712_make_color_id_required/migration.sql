-- Migration: Make color_id required in product_sizes
-- This enforces that every product size must be associated with a color

-- Step 1: For product_sizes with NULL color_id, assign the first color of each product
UPDATE product_sizes ps
SET color_id = (
  SELECT id
  FROM product_colors pc
  WHERE pc.product_id = ps.product_id
    AND pc.is_active = true
  ORDER BY pc.display_order ASC, pc.created_at ASC
  LIMIT 1
)
WHERE ps.color_id IS NULL
  AND EXISTS (
    SELECT 1 FROM product_colors pc 
    WHERE pc.product_id = ps.product_id
  );

-- Step 2: Handle edge case - sizes without any colors in their product
-- These will be deleted as they're orphaned
DELETE FROM product_sizes ps
WHERE ps.color_id IS NULL;

-- Step 3: Make color_id NOT NULL
ALTER TABLE product_sizes
ALTER COLUMN color_id SET NOT NULL;

-- Step 4: Add constraint - ensure unique combo of product + size + color
-- (This should already exist but making it explicit)
-- ALTER TABLE product_sizes
-- ADD CONSTRAINT product_sizes_product_size_color_unique UNIQUE (product_id, size, color_id);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN product_sizes.color_id IS 'Required: Every product size must be associated with a color';

