CREATE TABLE "invoice_number_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"series" varchar(8) NOT NULL,
	"next_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "invoice_number_sequences_user_series_key" UNIQUE("user_id","series")
);
--> statement-breakpoint
ALTER TABLE "invoice_number_sequences" ADD CONSTRAINT "fk_invoice_number_sequences_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "invoice_number_sequences" ("user_id", "series", "next_number")
SELECT
	"user_id",
	UPPER(SUBSTRING("invoice_id" FROM '^([A-Za-z]{2,8})[0-9]{1,9}$')) AS "series",
	MAX((SUBSTRING("invoice_id" FROM '^[A-Za-z]{2,8}([0-9]{1,9})$'))::integer) + 1 AS "next_number"
FROM "invoices"
WHERE "invoice_id" ~ '^[A-Za-z]{2,8}[0-9]{1,9}$'
GROUP BY "user_id", "series";
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_invoice_id_key" UNIQUE("user_id","invoice_id");
