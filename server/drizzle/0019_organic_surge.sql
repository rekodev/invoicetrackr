ALTER TABLE "invoices" ADD COLUMN "recipient_signing_email" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signing_created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signing_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signing_revoked_at" timestamp with time zone;--> statement-breakpoint
UPDATE "invoices"
SET
  "recipient_signing_created_at" = COALESCE("recipient_signing_sent_at", "recipient_signed_at"),
  "recipient_signing_expires_at" = CASE
    WHEN "recipient_signed_at" IS NOT NULL THEN "recipient_signed_at" + INTERVAL '90 days'
    ELSE "recipient_signing_sent_at" + INTERVAL '30 days'
  END
WHERE "recipient_signing_token" IS NOT NULL;
