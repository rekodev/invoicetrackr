ALTER TABLE "invoice_services" ADD COLUMN "vat_rate" numeric(5, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "subtotal_amount" numeric(10, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "vat_amount" numeric(10, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "lifecycle_status" varchar(50) DEFAULT 'draft' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "issued_at" timestamp with time zone;
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp with time zone;
ALTER TABLE "invoices" ADD COLUMN "voided_at" timestamp with time zone;

UPDATE "invoices"
SET
  "subtotal_amount" = "total_amount",
  "vat_amount" = '0',
  "lifecycle_status" = 'issued',
  "issued_at" = CURRENT_TIMESTAMP;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_lifecycle_status_check" CHECK ((lifecycle_status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'voided'::character varying])::text[]));
