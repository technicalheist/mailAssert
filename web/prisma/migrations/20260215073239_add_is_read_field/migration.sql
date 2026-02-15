/*
  Warnings:

  - You are about to drop the column `removed_at` on the `emails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "emails" DROP COLUMN "removed_at",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;
