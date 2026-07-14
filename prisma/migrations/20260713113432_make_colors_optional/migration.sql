-- Remove unique constraint on product_colors
ALTER TABLE "product_colors" DROP CONSTRAINT IF EXISTS "product_colors_product_id_name_key";

-- Make name nullable
ALTER TABLE "product_colors" ALTER COLUMN "name" DROP NOT NULL;

-- Make hex_code nullable
ALTER TABLE "product_colors" ALTER COLUMN "hex_code" DROP NOT NULL;
