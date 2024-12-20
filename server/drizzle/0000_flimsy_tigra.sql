-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "invoice_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"unit" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"date" date NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) NOT NULL,
	"due_date" date NOT NULL,
	"invoice_id" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"sender_signature" varchar(255),
	"bank_account_id" integer,
	CONSTRAINT "invoices_status_check" CHECK ((status)::text = ANY ((ARRAY['paid'::character varying, 'pending'::character varying, 'canceled'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"business_type" varchar(50) NOT NULL,
	"business_number" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_id" integer NOT NULL,
	CONSTRAINT "clients_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"type" varchar(50),
	"business_type" varchar(50),
	"business_number" varchar(255),
	"address" text,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"password" varchar(255) NOT NULL,
	"signature" varchar(255),
	"selected_bank_account_id" integer,
	"profile_picture_url" varchar(255),
	"currency" varchar(255),
	"language" varchar(255),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "banking_information" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"code" varchar(100),
	"account_number" varchar(100),
	"user_id" integer
);
--> statement-breakpoint
ALTER TABLE "invoice_services" ADD CONSTRAINT "fk_invoice_services_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_clients" FOREIGN KEY ("receiver_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_users" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_bank_account" FOREIGN KEY ("bank_account_id") REFERENCES "public"."banking_information"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "fk_clients_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "fk_selected_bank_account" FOREIGN KEY ("selected_bank_account_id") REFERENCES "public"."banking_information"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banking_information" ADD CONSTRAINT "banking_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
*/