-- CreateTable product_size_colors
CREATE TABLE "product_size_colors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "size_id" UUID NOT NULL,
    "color_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_size_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_size_colors_size_id_color_id_key" ON "product_size_colors"("size_id", "color_id");

-- CreateIndex
CREATE INDEX "product_size_colors_size_id_idx" ON "product_size_colors"("size_id");

-- CreateIndex
CREATE INDEX "product_size_colors_color_id_idx" ON "product_size_colors"("color_id");

-- AddForeignKey
ALTER TABLE "product_size_colors" ADD CONSTRAINT "product_size_colors_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "product_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_size_colors" ADD CONSTRAINT "product_size_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "product_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS on product_size_colors table
ALTER TABLE "product_size_colors" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (for public API)
CREATE POLICY "public_read_product_size_colors"
ON "product_size_colors"
FOR SELECT
USING (true);

-- Policy 2: Allow authenticated users (admin) full access
CREATE POLICY "admin_all_product_size_colors"
ON "product_size_colors"
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow service role full access (for backend operations)
CREATE POLICY "service_role_all_product_size_colors"
ON "product_size_colors"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on _prisma_migrations table
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to migrations
CREATE POLICY "public_read_prisma_migrations"
ON "_prisma_migrations"
FOR SELECT
USING (true);

-- Policy 2: Allow authenticated users (admin) full access
CREATE POLICY "admin_all_prisma_migrations"
ON "_prisma_migrations"
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow service role full access (for backend operations)
CREATE POLICY "service_role_all_prisma_migrations"
ON "_prisma_migrations"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
