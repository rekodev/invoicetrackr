ALTER TABLE "invoices" ADD COLUMN "currency" varchar(3);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "document_language" varchar(2);
--> statement-breakpoint
-- Historical output language was not stored. Freeze current owner defaults once.
UPDATE "invoices" AS i
SET "currency" = 'eur',
    "document_language" = CASE
      WHEN p."preferred_invoice_language" IN ('lt', 'en') THEN p."preferred_invoice_language"
      WHEN u."language" IN ('lt', 'en') THEN u."language"
      ELSE 'en'
    END
FROM "users" AS u
LEFT JOIN "business_profiles" AS p ON p."user_id" = u."id"
WHERE i."user_id" = u."id" AND i."lifecycle_status" <> 'draft';
--> statement-breakpoint
-- Keep legacy issued rows migratable even if their historical owner/profile is missing.
UPDATE "invoices"
SET "currency" = COALESCE("currency", 'eur'),
    "document_language" = COALESCE("document_language", 'en')
WHERE "lifecycle_status" <> 'draft'
  AND ("currency" IS NULL OR "document_language" IS NULL);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currency_check" CHECK ("currency" = 'eur');
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_document_language_check" CHECK ("document_language" IN ('lt', 'en'));
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_document_settings_check" CHECK (
  ("lifecycle_status" = 'draft' AND "currency" IS NULL AND "document_language" IS NULL)
  OR ("lifecycle_status" <> 'draft' AND "currency" IS NOT NULL AND "document_language" IS NOT NULL)
);
