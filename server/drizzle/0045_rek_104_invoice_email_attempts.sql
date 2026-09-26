ALTER TABLE "email_deliveries" ADD COLUMN "attempt_key" varchar(36);
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "content" jsonb;
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "provider_payload" jsonb;
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "provider_started_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "recovery_expires_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "lease_token" varchar(36);
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD COLUMN "lease_until" timestamp with time zone;
--> statement-breakpoint
CREATE UNIQUE INDEX "email_deliveries_user_attempt_key" ON "email_deliveries" ("user_id", "attempt_key");
--> statement-breakpoint
ALTER TABLE "email_deliveries" DROP CONSTRAINT "email_deliveries_status_check";
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_status_check" CHECK ("status" IN ('queued', 'sent', 'delivered', 'failed', 'bounced', 'unknown'));
