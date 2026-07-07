CREATE TABLE IF NOT EXISTS "expenses" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "expense_date" date NOT NULL,
  "payment_date" date,
  "supplier" varchar(255) NOT NULL,
  "document_number" varchar(255),
  "description" text NOT NULL,
  "category" varchar(100) NOT NULL,
  "currency" varchar(3) DEFAULT 'eur' NOT NULL,
  "total_amount" numeric(10, 2) NOT NULL,
  "eur_amount" numeric(10, 2) NOT NULL,
  "vat_amount" numeric(10, 2),
  "business_use_percentage" numeric(5, 2) DEFAULT '100' NOT NULL,
  "deductible_amount" numeric(10, 2) NOT NULL,
  "payment_method" varchar(50),
  "notes" text,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_attachments" (
  "id" serial PRIMARY KEY NOT NULL,
  "expense_id" integer NOT NULL,
  "storage_provider" varchar(50) DEFAULT 'cloudinary' NOT NULL,
  "storage_key" varchar(255) NOT NULL,
  "secure_url" text NOT NULL,
  "resource_type" varchar(50) DEFAULT 'auto' NOT NULL,
  "original_file_name" text NOT NULL,
  "sanitized_file_name" text NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "file_size" integer NOT NULL,
  "checksum" varchar(64) NOT NULL,
  "malware_scan_status" varchar(50) DEFAULT 'not_configured' NOT NULL,
  "deleted_at" timestamp with time zone,
  "uploaded_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_attachment_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "expense_id" integer NOT NULL,
  "attachment_id" integer,
  "action" varchar(50) NOT NULL,
  "previous_value" jsonb,
  "new_value" jsonb,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "fk_expenses_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_attachments" ADD CONSTRAINT "fk_expense_attachments_expense_id" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_attachment_events" ADD CONSTRAINT "fk_expense_attachment_events_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_attachment_events" ADD CONSTRAINT "fk_expense_attachment_events_expense_id" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_attachment_events" ADD CONSTRAINT "fk_expense_attachment_events_attachment_id" FOREIGN KEY ("attachment_id") REFERENCES "public"."expense_attachments"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_use_percentage_check" CHECK ("expenses"."business_use_percentage" >= 0 AND "expenses"."business_use_percentage" <= 100);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_total_amount_check" CHECK ("expenses"."total_amount" >= 0);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_eur_amount_check" CHECK ("expenses"."eur_amount" >= 0);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_deductible_amount_check" CHECK ("expenses"."deductible_amount" >= 0);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_user_date_idx" ON "expenses" USING btree ("user_id", "expense_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expense_attachments_expense_id_idx" ON "expense_attachments" USING btree ("expense_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "expense_attachments_checksum_expense_key" ON "expense_attachments" USING btree ("expense_id", "checksum") WHERE "deleted_at" IS NULL;
