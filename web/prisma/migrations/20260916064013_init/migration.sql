-- CreateTable
CREATE TABLE "ma_users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_login" BOOLEAN NOT NULL DEFAULT false,
    "notify_on_new_email" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_inbox_created" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_inbox_deleted" BOOLEAN NOT NULL DEFAULT true,
    "notify_weekly_summary" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_password_change" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_api_key_created" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_inboxes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT,
    "inbox_id" TEXT NOT NULL,
    "mail_domain" TEXT NOT NULL DEFAULT 'mailassert.com',
    "status" TEXT NOT NULL DEFAULT 'active',
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_inboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ma_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_email_verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_api_keys" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "last_used" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_emails" (
    "id" SERIAL NOT NULL,
    "inbox_id" INTEGER NOT NULL,
    "message_id" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "subject" TEXT,
    "body_text" TEXT,
    "body_html" TEXT,
    "headers" JSONB,
    "imap_uid" INTEGER NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ma_users_email_key" ON "ma_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ma_inboxes_inbox_id_key" ON "ma_inboxes"("inbox_id");

-- CreateIndex
CREATE UNIQUE INDEX "ma_password_reset_tokens_token_key" ON "ma_password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ma_email_verification_tokens_token_key" ON "ma_email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ma_api_keys_key_key" ON "ma_api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ma_emails_message_id_key" ON "ma_emails"("message_id");

-- CreateIndex
CREATE INDEX "ma_emails_inbox_id_idx" ON "ma_emails"("inbox_id");

-- CreateIndex
CREATE INDEX "ma_emails_imap_uid_inbox_id_idx" ON "ma_emails"("imap_uid", "inbox_id");

-- AddForeignKey
ALTER TABLE "ma_inboxes" ADD CONSTRAINT "ma_inboxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ma_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_password_reset_tokens" ADD CONSTRAINT "ma_password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ma_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_email_verification_tokens" ADD CONSTRAINT "ma_email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ma_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_api_keys" ADD CONSTRAINT "ma_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ma_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_emails" ADD CONSTRAINT "ma_emails_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "ma_inboxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

