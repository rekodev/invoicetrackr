ALTER TABLE "invoice_services" ALTER COLUMN "quantity" SET DATA TYPE numeric(12,4) USING "quantity"::numeric;
ALTER TABLE "invoices" ALTER COLUMN "invoice_id" DROP NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "invoice_series" varchar(8);
UPDATE "invoices"
SET "invoice_series" = substring(upper("invoice_id") from '^([A-Z]{2,8})[0-9]{1,9}$')
WHERE "invoice_id" IS NOT NULL;
ALTER TABLE "invoices" ADD COLUMN "crypto_wallet_id" integer;
ALTER TABLE "invoices" ADD COLUMN "recipient_details_token" varchar(255);
ALTER TABLE "invoices" ADD COLUMN "recipient_details_created_at" timestamp with time zone;
ALTER TABLE "invoices" ADD COLUMN "recipient_details_expires_at" timestamp with time zone;
ALTER TABLE "invoices" ADD COLUMN "recipient_details_submitted_at" timestamp with time zone;
ALTER TABLE "invoices" ADD COLUMN "recipient_details_revoked_at" timestamp with time zone;
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_payment_mode_check";
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_mode_check" CHECK ("payment_mode" IN ('manual', 'crypto', 'disabled'));
CREATE UNIQUE INDEX "invoices_recipient_details_token_key" ON "invoices" ("recipient_details_token");

CREATE TABLE "crypto_wallets" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "label" varchar(100) NOT NULL,
  "asset" varchar(20) NOT NULL,
  "network" varchar(100) NOT NULL,
  "address" varchar(255) NOT NULL,
  "memo" varchar(255),
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "crypto_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade,
  CONSTRAINT "crypto_wallets_id_user_id_key" UNIQUE("id", "user_id"),
  CONSTRAINT "crypto_wallets_user_network_address_key" UNIQUE("user_id", "network", "address")
);
CREATE UNIQUE INDEX "crypto_wallets_one_default_per_user_idx" ON "crypto_wallets" ("user_id") WHERE "is_default" = true;

CREATE TABLE "invoice_crypto_wallets" (
  "id" serial PRIMARY KEY NOT NULL,
  "invoice_id" integer NOT NULL,
  "label" varchar(100) NOT NULL,
  "asset" varchar(20) NOT NULL,
  "network" varchar(100) NOT NULL,
  "address" varchar(255) NOT NULL,
  "memo" varchar(255),
  CONSTRAINT "fk_invoice_crypto_wallets_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade
);

ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_invoice_crypto_wallet" FOREIGN KEY ("crypto_wallet_id") REFERENCES "invoice_crypto_wallets"("id") ON DELETE cascade;
