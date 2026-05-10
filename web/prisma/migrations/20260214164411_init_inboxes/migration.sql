/*
  Warnings:

  - You are about to drop the `user_secure_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_secure_data" DROP CONSTRAINT "user_secure_data_user_id_fkey";

-- DropTable
DROP TABLE "user_secure_data";

-- CreateTable
CREATE TABLE "inboxes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT,
    "inbox_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inboxes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inboxes_inbox_id_key" ON "inboxes"("inbox_id");

-- AddForeignKey
ALTER TABLE "inboxes" ADD CONSTRAINT "inboxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
