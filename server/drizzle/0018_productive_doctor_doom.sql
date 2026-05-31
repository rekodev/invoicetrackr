ALTER TABLE "invoices" ADD COLUMN "receiver_signature" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signing_token" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signing_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recipient_signed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_recipient_signing_token_key" UNIQUE("recipient_signing_token");