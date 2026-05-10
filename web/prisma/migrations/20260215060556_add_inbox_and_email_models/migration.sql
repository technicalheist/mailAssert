/*
  Warnings:

  - You are about to drop the column `body` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `raw` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `emails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[message_id]` on the table `emails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `from_address` to the `emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imap_uid` to the `emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_id` to the `emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_address` to the `emails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emails" DROP COLUMN "body",
DROP COLUMN "from",
DROP COLUMN "raw",
DROP COLUMN "to",
ADD COLUMN     "body_html" TEXT,
ADD COLUMN     "body_text" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "from_address" TEXT NOT NULL,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "imap_uid" INTEGER NOT NULL,
ADD COLUMN     "message_id" TEXT NOT NULL,
ADD COLUMN     "to_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inboxes" ADD COLUMN     "mail_domain" TEXT NOT NULL DEFAULT 'mailassert.com',
ADD COLUMN     "removed_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "emails_message_id_key" ON "emails"("message_id");

-- CreateIndex
CREATE INDEX "emails_inbox_id_idx" ON "emails"("inbox_id");

-- CreateIndex
CREATE INDEX "emails_imap_uid_inbox_id_idx" ON "emails"("imap_uid", "inbox_id");
