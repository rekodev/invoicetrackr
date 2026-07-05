ALTER TABLE "invoices" ADD COLUMN "payment_mode" varchar(50) DEFAULT 'auto' NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "manual_payment_reference" text;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_mode_check" CHECK ((payment_mode)::text = ANY ((ARRAY['auto'::character varying, 'online'::character varying, 'manual'::character varying, 'disabled'::character varying])::text[]));
