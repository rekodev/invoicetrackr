ALTER TABLE "users" ADD COLUMN "analytics_consent_status" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "analytics_consent_updated_at" timestamp with time zone;
