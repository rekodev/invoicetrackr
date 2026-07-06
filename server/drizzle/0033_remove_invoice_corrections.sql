ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "fk_invoices_corrected_by_invoice_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "fk_invoices_original_invoice_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_document_type_check";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "document_type";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "original_invoice_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "corrected_by_invoice_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "correction_reason";
