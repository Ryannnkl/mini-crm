ALTER TABLE "companies" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "primary_contact_name" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "primary_contact_email" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "potential_value" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "lead_source" text DEFAULT 'other' NOT NULL;