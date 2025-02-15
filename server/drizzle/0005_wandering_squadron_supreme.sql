ALTER TABLE "invoice_banking_information" DROP CONSTRAINT "fk_invoice_bank_accounts_invoice_id";
--> statement-breakpoint
ALTER TABLE "invoice_banking_information" ADD CONSTRAINT "fk_invoice_banking_information_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;