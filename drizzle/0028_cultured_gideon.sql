CREATE TABLE "Contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"clientId" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"updatedDate" timestamp,
	"updatedBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Contact_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "PhoneNumber" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerType" text NOT NULL,
	"ownerId" uuid NOT NULL,
	"number" text NOT NULL,
	"type" text,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "PhoneNumber_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "EmailAddress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerType" text NOT NULL,
	"ownerId" uuid NOT NULL,
	"email" text NOT NULL,
	"type" text,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "EmailAddress_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerType" text NOT NULL,
	"ownerId" uuid NOT NULL,
	"name" text,
	"address" text NOT NULL,
	"zoneIdentifier" text,
	"city" text,
	"region" text,
	"country" text,
	"type" "location_type",
	"latitude" text,
	"longitude" text,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Location_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "updatedDate" timestamp;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "updatedBy" uuid;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedBy_User_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Location" ADD CONSTRAINT "Location_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Location" ADD CONSTRAINT "Location_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_client_idx" ON "Contact" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "phone_number_owner_idx" ON "PhoneNumber" USING btree ("ownerType","ownerId");--> statement-breakpoint
CREATE INDEX "email_address_owner_idx" ON "EmailAddress" USING btree ("ownerType","ownerId");--> statement-breakpoint
CREATE INDEX "location_owner_idx" ON "Location" USING btree ("ownerType","ownerId");--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_updatedBy_User_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;