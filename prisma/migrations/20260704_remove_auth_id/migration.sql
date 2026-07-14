-- Remove auth_id column from admin_users
ALTER TABLE "admin_users" DROP COLUMN IF EXISTS "auth_id";
