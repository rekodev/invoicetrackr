CREATE TABLE "stripe_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_event_id" text NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "stripe_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "stripe_accounts" ALTER COLUMN "stripe_subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_grace_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_current_period_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_cancel_at" timestamp with time zone;--> statement-breakpoint
UPDATE "stripe_accounts" SET "stripe_subscription_id" = NULL WHERE "stripe_subscription_id" = '';--> statement-breakpoint
UPDATE "users"
SET "onboarding_completed_at" = CURRENT_TIMESTAMP
WHERE "name" <> '' AND "business_number" <> '' AND "address" <> '';--> statement-breakpoint
ALTER TABLE "stripe_accounts" ADD CONSTRAINT "stripe_accounts_user_id_unique" UNIQUE("user_id");
