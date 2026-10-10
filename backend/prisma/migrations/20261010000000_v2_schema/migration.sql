-- Reconcile the database with the Prisma schema.
-- Earlier migrations added "Mailbox"."browserId" (never used by the schema) and never
-- created "Message"."expiresAt" or the expiry indexes, so fresh deployments could not
-- store incoming mail.

-- Mailbox -------------------------------------------------------------------
ALTER TABLE "Mailbox" DROP COLUMN IF EXISTS "browserId";

UPDATE "Mailbox" SET "expiresAt" = "createdAt" + INTERVAL '24 hours' WHERE "expiresAt" IS NULL;
ALTER TABLE "Mailbox" ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Mailbox_expiresAt_idx" ON "Mailbox"("expiresAt");

-- Message -------------------------------------------------------------------
-- IF NOT EXISTS: databases that were synced with `prisma db push` already have it.
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
UPDATE "Message" SET "expiresAt" = "createdAt" + INTERVAL '24 hours' WHERE "expiresAt" IS NULL;
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET NOT NULL;

ALTER TABLE "Message"
    ADD COLUMN "preview" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "size" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Message" SET "size" = octet_length("raw");

CREATE INDEX IF NOT EXISTS "Message_expiresAt_idx" ON "Message"("expiresAt");
CREATE INDEX "Message_mailboxId_createdAt_idx" ON "Message"("mailboxId", "createdAt");
