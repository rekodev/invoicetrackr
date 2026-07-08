CREATE TABLE IF NOT EXISTS "expense_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "expense_id" integer NOT NULL,
  "action" varchar(50) NOT NULL,
  "previous_value" jsonb,
  "new_value" jsonb,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "expense_events" ADD CONSTRAINT "fk_expense_events_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_events" ADD CONSTRAINT "fk_expense_events_expense_id" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
