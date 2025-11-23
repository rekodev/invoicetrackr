ALTER TABLE "clients" ADD COLUMN "vat_number" varchar(255);--> statement-breakpoint
ALTER TABLE "invoice_receivers" ADD COLUMN "vat_number" varchar(255);--> statement-breakpoint
ALTER TABLE "invoice_senders" ADD COLUMN "vat_number" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vat_number" varchar(255);