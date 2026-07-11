CREATE TABLE "business_profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "legal_name" varchar(255) DEFAULT '' NOT NULL,
  "activity_certificate_number" varchar(255) DEFAULT '' NOT NULL,
  "address" text DEFAULT '' NOT NULL,
  "invoice_email" varchar(255) DEFAULT '' NOT NULL,
  "phone" varchar(50),
  "vat_number" varchar(255),
  "signature_url" text DEFAULT '' NOT NULL,
  "logo_url" text DEFAULT '' NOT NULL,
  "selected_bank_account_id" integer,
  "currency" varchar(3) DEFAULT 'eur' NOT NULL,
  "preferred_invoice_language" varchar(2),
  "is_vat_payer" boolean DEFAULT false NOT NULL,
  "default_invoice_vat_mode" varchar(20) DEFAULT 'no_vat' NOT NULL,
  "default_invoice_series" varchar(8) DEFAULT 'SF' NOT NULL,
  "default_payment_terms_days" integer DEFAULT 30 NOT NULL,
  "onboarding_completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "business_profiles_user_id_key" UNIQUE("user_id"),
  CONSTRAINT "business_profiles_currency_check" CHECK ("currency" = 'eur'),
  CONSTRAINT "business_profiles_vat_mode_check" CHECK ("default_invoice_vat_mode" IN ('no_vat', 'standard_21', 'zero', 'manual')),
  CONSTRAINT "business_profiles_payment_terms_check" CHECK ("default_payment_terms_days" IN (7, 14, 30)),
  CONSTRAINT "business_profiles_invoice_series_check" CHECK ("default_invoice_series" ~ '^[A-Z]{2,8}$')
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
--> statement-breakpoint
ALTER TABLE "banking_information" ADD COLUMN "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
--> statement-breakpoint
ALTER TABLE "banking_information" ADD COLUMN "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
--> statement-breakpoint
INSERT INTO "business_profiles" (
  "user_id", "legal_name", "activity_certificate_number", "address", "invoice_email",
  "vat_number", "signature_url", "logo_url", "selected_bank_account_id", "currency",
  "preferred_invoice_language", "is_vat_payer", "default_invoice_vat_mode",
  "default_invoice_series", "default_payment_terms_days", "onboarding_completed_at",
  "created_at", "updated_at"
)
SELECT
  "id", "name", "business_number", "address", "email", "vat_number", "signature",
  "profile_picture_url", "selected_bank_account_id", 'eur',
  "preferred_invoice_language", "is_vat_payer", "default_invoice_vat_mode",
  "default_invoice_series", "default_payment_terms_days", "onboarding_completed_at",
  COALESCE("created_at", CURRENT_TIMESTAMP), COALESCE("updated_at", CURRENT_TIMESTAMP)
FROM "users";
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_selected_bank_account";
--> statement-breakpoint
UPDATE "business_profiles" AS bp
SET "selected_bank_account_id" = NULL
WHERE "selected_bank_account_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "banking_information" AS bi
    WHERE bi."id" = bp."selected_bank_account_id" AND bi."user_id" = bp."user_id"
  );
--> statement-breakpoint
DELETE FROM "banking_information" WHERE "user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "banking_information" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "banking_information" ADD CONSTRAINT "banking_information_id_user_id_key" UNIQUE("id", "user_id");
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_selected_bank_account_id_user_id_banking_information_id_user_id_fk" FOREIGN KEY ("selected_bank_account_id", "user_id") REFERENCES "banking_information"("id", "user_id") ON DELETE restrict;
--> statement-breakpoint
CREATE TABLE "tax_profiles" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "tax_year" integer NOT NULL,
  "expense_method" varchar(30) NOT NULL, "is_vat_registered" boolean DEFAULT false NOT NULL,
  "has_employment_psd_coverage" boolean DEFAULT false NOT NULL,
  "monthly_psd_amount" numeric(12,2) DEFAULT '0' NOT NULL,
  "additional_pension_rate" numeric(5,2) DEFAULT '0' NOT NULL,
  "activity_start_date" date, "activity_end_date" date,
  "other_declared_income" numeric(12,2) DEFAULT '0' NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "tax_profiles_user_year_key" UNIQUE("user_id", "tax_year"),
  CONSTRAINT "tax_profiles_year_check" CHECK ("tax_year" >= 2020),
  CONSTRAINT "tax_profiles_expense_method_check" CHECK ("expense_method" IN ('actual', 'thirty_percent')),
  CONSTRAINT "tax_profiles_monthly_psd_check" CHECK ("monthly_psd_amount" >= 0),
  CONSTRAINT "tax_profiles_other_income_check" CHECK ("other_declared_income" >= 0)
);
--> statement-breakpoint
ALTER TABLE "tax_profiles" ADD CONSTRAINT "tax_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE TABLE "payments" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "payment_date" date NOT NULL,
  "amount" numeric(12,2) NOT NULL, "currency" varchar(3) DEFAULT 'eur' NOT NULL,
  "eur_amount" numeric(12,2) NOT NULL, "method" varchar(30) DEFAULT 'bank_transfer' NOT NULL,
  "bank_reference" text, "notes" text, "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "payments_id_user_id_key" UNIQUE("id", "user_id"),
  CONSTRAINT "payments_amount_check" CHECK ("amount" > 0),
  CONSTRAINT "payments_eur_amount_check" CHECK ("eur_amount" > 0),
  CONSTRAINT "payments_method_check" CHECK ("method" IN ('bank_transfer', 'cash', 'other'))
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX "payments_user_date_idx" ON "payments" ("user_id", "payment_date");
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "payment_id" integer NOT NULL,
  "invoice_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "payment_allocations_payment_invoice_key" UNIQUE("payment_id", "invoice_id"),
  CONSTRAINT "payment_allocations_amount_check" CHECK ("amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_id_user_id_key" UNIQUE("id", "user_id");
--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_user_id_payments_id_user_id_fk" FOREIGN KEY ("payment_id", "user_id") REFERENCES "payments"("id", "user_id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_user_id_invoices_id_user_id_fk" FOREIGN KEY ("invoice_id", "user_id") REFERENCES "invoices"("id", "user_id") ON DELETE restrict;
--> statement-breakpoint
CREATE INDEX "payment_allocations_user_invoice_idx" ON "payment_allocations" ("user_id", "invoice_id");
--> statement-breakpoint
CREATE TABLE "email_deliveries" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "invoice_id" integer,
  "provider" varchar(50) NOT NULL, "provider_message_id" varchar(255), "kind" varchar(50) NOT NULL,
  "recipient" varchar(255) NOT NULL, "status" varchar(30) DEFAULT 'queued' NOT NULL,
  "sent_at" timestamp with time zone, "delivered_at" timestamp with time zone,
  "failed_at" timestamp with time zone, "failure_code" varchar(100),
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "email_deliveries_status_check" CHECK ("status" IN ('queued', 'sent', 'delivered', 'failed', 'bounced'))
);
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE set null;
--> statement-breakpoint
CREATE UNIQUE INDEX "email_deliveries_provider_message_key" ON "email_deliveries" ("provider", "provider_message_id");
--> statement-breakpoint
CREATE INDEX "email_deliveries_user_created_idx" ON "email_deliveries" ("user_id", "created_at");
--> statement-breakpoint
CREATE TABLE "tax_estimates" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "tax_profile_id" integer NOT NULL,
  "tax_year" integer NOT NULL, "rule_version" varchar(50) NOT NULL, "calculation_version" integer NOT NULL,
  "taxable_profit" numeric(12,2) NOT NULL, "gpm_amount" numeric(12,2) NOT NULL,
  "vsd_amount" numeric(12,2) NOT NULL, "psd_amount" numeric(12,2) NOT NULL,
  "total_amount" numeric(12,2) NOT NULL, "assumptions" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "tax_estimates_user_year_version_key" UNIQUE("user_id", "tax_year", "calculation_version"),
  CONSTRAINT "tax_estimates_taxable_profit_check" CHECK ("taxable_profit" >= 0),
  CONSTRAINT "tax_estimates_gpm_check" CHECK ("gpm_amount" >= 0),
  CONSTRAINT "tax_estimates_vsd_check" CHECK ("vsd_amount" >= 0),
  CONSTRAINT "tax_estimates_psd_check" CHECK ("psd_amount" >= 0),
  CONSTRAINT "tax_estimates_total_check" CHECK ("total_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "tax_estimates" ADD CONSTRAINT "tax_estimates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "tax_estimates" ADD CONSTRAINT "tax_estimates_tax_profile_id_tax_profiles_id_fk" FOREIGN KEY ("tax_profile_id") REFERENCES "tax_profiles"("id") ON DELETE restrict;
--> statement-breakpoint
CREATE INDEX "tax_estimates_user_year_idx" ON "tax_estimates" ("user_id", "tax_year");
--> statement-breakpoint
CREATE TABLE "tax_payments" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "tax_year" integer NOT NULL,
  "tax_type" varchar(20) NOT NULL, "payment_date" date NOT NULL, "amount" numeric(12,2) NOT NULL,
  "notes" text, "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "tax_payments_type_check" CHECK ("tax_type" IN ('gpm', 'vsd', 'psd')),
  CONSTRAINT "tax_payments_amount_check" CHECK ("amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX "tax_payments_user_year_idx" ON "tax_payments" ("user_id", "tax_year");
--> statement-breakpoint
CREATE TABLE "audit_events" (
  "id" serial PRIMARY KEY NOT NULL, "user_id" integer, "actor_user_id" integer,
  "action" varchar(100) NOT NULL, "entity_type" varchar(50) NOT NULL, "entity_id" varchar(100),
  "previous_value" jsonb, "new_value" jsonb, "request_id" varchar(100),
  "ip_address" varchar(64), "user_agent" text,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
CREATE INDEX "audit_events_user_created_idx" ON "audit_events" ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" ("entity_type", "entity_id");
--> statement-breakpoint
INSERT INTO "audit_events" ("user_id", "actor_user_id", "action", "entity_type", "entity_id", "previous_value", "new_value", "created_at")
SELECT "user_id", "user_id", 'expense.' || "action", 'expense', "expense_id"::text, "previous_value", "new_value", COALESCE("created_at", CURRENT_TIMESTAMP)
FROM "expense_events";
--> statement-breakpoint
INSERT INTO "audit_events" ("user_id", "actor_user_id", "action", "entity_type", "entity_id", "previous_value", "new_value", "created_at")
SELECT "user_id", "user_id", 'expense_attachment.' || "action", 'expense_attachment', "attachment_id"::text, "previous_value", "new_value", COALESCE("created_at", CURRENT_TIMESTAMP)
FROM "expense_attachment_events";
--> statement-breakpoint
DROP TABLE "expense_attachment_events";
--> statement-breakpoint
DROP TABLE "expense_events";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_selected_bank_account";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_default_invoice_vat_mode_check";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_default_payment_terms_days_check";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_default_invoice_series_check";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name", DROP COLUMN "type", DROP COLUMN "business_type",
  DROP COLUMN "business_number", DROP COLUMN "vat_number", DROP COLUMN "address",
  DROP COLUMN "signature", DROP COLUMN "selected_bank_account_id", DROP COLUMN "profile_picture_url",
  DROP COLUMN "currency", DROP COLUMN "preferred_invoice_language", DROP COLUMN "is_vat_payer",
  DROP COLUMN "default_invoice_vat_mode", DROP COLUMN "default_invoice_series",
  DROP COLUMN "default_payment_terms_days", DROP COLUMN "onboarding_completed_at";

-- Recovery: restore the removed user columns from business_profiles before dropping
-- any new tables. Audit events are append-only and should be exported before rollback.
