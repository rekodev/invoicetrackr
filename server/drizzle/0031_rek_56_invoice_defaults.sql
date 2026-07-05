ALTER TABLE "users" ADD COLUMN "is_vat_payer" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "default_invoice_vat_mode" varchar(20) DEFAULT 'no_vat' NOT NULL;
ALTER TABLE "users" ADD COLUMN "default_invoice_series" varchar(8) DEFAULT 'SF' NOT NULL;
ALTER TABLE "users" ADD COLUMN "default_payment_terms_days" integer DEFAULT 30 NOT NULL;

ALTER TABLE "users" ADD CONSTRAINT "users_default_invoice_vat_mode_check" CHECK ("default_invoice_vat_mode" IN ('no_vat', 'standard_21', 'zero', 'manual'));
ALTER TABLE "users" ADD CONSTRAINT "users_default_payment_terms_days_check" CHECK ("default_payment_terms_days" IN (7, 14, 30));
ALTER TABLE "users" ADD CONSTRAINT "users_default_invoice_series_check" CHECK ("default_invoice_series" ~ '^[A-Z]{2,8}$');
