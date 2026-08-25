ALTER TABLE "invoices" ADD COLUMN "service_date" date;
UPDATE "invoices" SET "service_date" = "date" WHERE "service_date" IS NULL;
ALTER TABLE "invoices" ALTER COLUMN "service_date" SET NOT NULL;

ALTER TABLE "invoices" ADD COLUMN "notes" text;

ALTER TABLE "invoice_services" ADD COLUMN "position" integer;
WITH ordered_services AS (
  SELECT "id", (row_number() OVER (PARTITION BY "invoice_id" ORDER BY "id") - 1)::integer AS "position"
  FROM "invoice_services"
)
UPDATE "invoice_services"
SET "position" = ordered_services."position"
FROM ordered_services
WHERE "invoice_services"."id" = ordered_services."id";
ALTER TABLE "invoice_services" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "invoice_services" ADD CONSTRAINT "invoice_services_position_check" CHECK ("position" >= 0);

ALTER TABLE "invoices" ALTER COLUMN "subtotal_amount" SET DATA TYPE numeric(16,2);
ALTER TABLE "invoices" ALTER COLUMN "vat_amount" SET DATA TYPE numeric(16,2);
ALTER TABLE "invoices" ALTER COLUMN "total_amount" SET DATA TYPE numeric(16,2);
