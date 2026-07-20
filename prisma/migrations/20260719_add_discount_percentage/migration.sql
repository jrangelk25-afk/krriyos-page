-- Add discount_percentage column to products table
ALTER TABLE products ADD COLUMN discount_percentage INTEGER NOT NULL DEFAULT 0;

-- Create index on discount_percentage for faster queries on outlet products with discounts
CREATE INDEX idx_products_discount_percentage ON products(discount_percentage);
