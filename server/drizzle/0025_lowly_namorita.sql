ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "payment_success_pending" boolean DEFAULT false NOT NULL;
