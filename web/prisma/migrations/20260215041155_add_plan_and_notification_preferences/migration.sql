-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notify_on_api_key_created" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_on_inbox_created" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_on_inbox_deleted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_on_login" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify_on_new_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_on_password_change" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_weekly_summary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';
