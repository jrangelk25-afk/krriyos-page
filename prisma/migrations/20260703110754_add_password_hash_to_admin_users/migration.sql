-- AlterTable - Remove auth_id and add password_hash to admin_users
ALTER TABLE "admin_users" DROP CONSTRAINT IF EXISTS "admin_users_auth_id_key";

ALTER TABLE "admin_users" DROP COLUMN IF EXISTS "auth_id";

ALTER TABLE "admin_users" ADD COLUMN "password_hash" VARCHAR(255) NOT NULL DEFAULT '';

-- Ensure unique index on email exists
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");

-- Ensure email index exists
CREATE INDEX IF NOT EXISTS "admin_users_email_idx" ON "admin_users"("email");
