-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "removed_at" TIMESTAMP(3);
