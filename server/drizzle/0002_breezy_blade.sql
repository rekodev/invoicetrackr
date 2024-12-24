ALTER TABLE "invoices" ALTER COLUMN "invoice_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "sender_signature" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "bank_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "business_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "business_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "signature" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "selected_bank_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "profile_picture_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "currency" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "language" SET NOT NULL;