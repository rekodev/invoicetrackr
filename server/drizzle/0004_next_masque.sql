CREATE TABLE "invoice_banking_information" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"accountName" varchar(255) NOT NULL,
	"accountNumber" varchar(100) NOT NULL,
	"bankCode" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_receivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"business_type" varchar(50) NOT NULL,
	"business_number" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_senders" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"business_type" varchar(50) NOT NULL,
	"business_number" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "fk_invoices_clients";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "fk_invoices_users";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "fk_bank_account";
--> statement-breakpoint
ALTER TABLE "invoice_banking_information" ADD CONSTRAINT "fk_invoice_bank_accounts_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_receivers" ADD CONSTRAINT "fk_invoice_receivers_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_senders" ADD CONSTRAINT "fk_invoice_senders_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_invoice_senders" FOREIGN KEY ("sender_id") REFERENCES "public"."invoice_senders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_invoice_receivers" FOREIGN KEY ("receiver_id") REFERENCES "public"."invoice_receivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_invoice_banking_information" FOREIGN KEY ("bank_account_id") REFERENCES "public"."invoice_banking_information"("id") ON DELETE cascade ON UPDATE no action;