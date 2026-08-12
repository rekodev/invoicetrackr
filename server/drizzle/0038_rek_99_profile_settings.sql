ALTER TABLE "business_profiles" ADD COLUMN "logo_storage_key" text;--> statement-breakpoint
ALTER TABLE "invoice_senders" ADD COLUMN "logo_url" text DEFAULT '' NOT NULL;
