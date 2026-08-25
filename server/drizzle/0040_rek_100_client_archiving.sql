ALTER TABLE "clients" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "clients_user_active_idx" ON "clients" USING btree ("user_id") WHERE "archived_at" IS NULL;
