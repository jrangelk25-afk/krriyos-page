-- AddColumn isOutlet to products table
ALTER TABLE "products" ADD COLUMN "is_outlet" BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster queries
CREATE INDEX "idx_products_is_outlet" ON "products"("is_outlet");
