ALTER TABLE "invoices" ADD COLUMN "document_type" varchar(50) DEFAULT 'invoice' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "original_invoice_id" integer;
ALTER TABLE "invoices" ADD COLUMN "corrected_by_invoice_id" integer;
ALTER TABLE "invoices" ADD COLUMN "correction_reason" text;

ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_original_invoice_id" FOREIGN KEY ("original_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_corrected_by_invoice_id" FOREIGN KEY ("corrected_by_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_document_type_check" CHECK ((document_type)::text = ANY ((ARRAY['invoice'::character varying, 'corrected_invoice'::character varying, 'credit_note'::character varying])::text[]));
