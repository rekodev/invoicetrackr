DROP TABLE IF EXISTS "stripe_webhook_events";
--> statement-breakpoint
DROP TABLE IF EXISTS "stripe_merchant_accounts";
--> statement-breakpoint
DROP TABLE IF EXISTS "stripe_accounts";
--> statement-breakpoint
DROP INDEX IF EXISTS "invoices_payment_checkout_session_id_unique_idx";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_payment_checkout_session_id_key";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_payment_mode_check";
--> statement-breakpoint
UPDATE "invoices"
SET "payment_mode" = 'manual'
WHERE "payment_mode" IN ('auto', 'online') OR "payment_mode" IS NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "payment_mode" SET DEFAULT 'manual';
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_mode_check" CHECK ((payment_mode)::text = ANY ((ARRAY['manual'::character varying, 'disabled'::character varying])::text[]));
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "payment_provider";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "payment_checkout_session_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "payment_intent_id";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "payment_completed_at";
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "payment_failed_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscription_status";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "trial_started_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "trial_ends_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscription_grace_ends_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscription_current_period_ends_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscription_cancel_at";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "payment_success_pending";
