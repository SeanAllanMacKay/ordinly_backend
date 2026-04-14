ALTER TABLE "Company" ADD COLUMN "isPersonal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD COLUMN "isPersonal" boolean DEFAULT false NOT NULL;