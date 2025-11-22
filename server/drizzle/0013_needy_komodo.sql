ALTER TABLE "stripe_accounts" ALTER COLUMN "stripe_subscription_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferred_invoice_language" varchar(255);--> statement-breakpoint
ALTER TABLE "stripe_accounts" ADD CONSTRAINT "stripe_accounts_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");