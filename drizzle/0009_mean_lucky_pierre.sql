CREATE TABLE "CompanyPaymentMethod" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"paymentMethodId" uuid NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyPaymentMethod_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "PaymentMethod" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"logoURL" text NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "PaymentMethod_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileHoursOfOperation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"mondayStart" time,
	"mondayEnd" time,
	"tuesdayStart" time,
	"tuesdayEnd" time,
	"wednesdayStart" time,
	"wednesdayEnd" time,
	"thursdayStart" time,
	"thursdayEnd" time,
	"fridayStart" time,
	"fridayEnd" time,
	"saturdayStart" time,
	"saturdayEnd" time,
	"sundayStart" time,
	"sundayEnd" time,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileHoursOfOperation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileAlbum" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileAlbum_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileAlbumImage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileAlbumId" uuid NOT NULL,
	"image" uuid NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileAlbumImage_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileDocument_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileEmail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"email" text NOT NULL,
	"description" text,
	"type" text,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileEmail_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileInfoList" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileInfoList_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileInfoListItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfilInfoListId" uuid NOT NULL,
	"label" text NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileInfoListItem_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileLocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"address" text NOT NULL,
	"zoneIdentifier" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"country" text NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileLocation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfilePhoneNumber" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"number" text NOT NULL,
	"type" text,
	"description" text,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfilePhoneNumber_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfileWebsite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProfileId" uuid NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyProfileWebsite_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Company" DROP CONSTRAINT "Company_profile_CompanyProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ALTER COLUMN "roleId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyProfile" ADD COLUMN "companyId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyProfile" ADD COLUMN "establishedDate" date;--> statement-breakpoint
ALTER TABLE "CompanyPaymentMethod" ADD CONSTRAINT "CompanyPaymentMethod_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyPaymentMethod" ADD CONSTRAINT "CompanyPaymentMethod_paymentMethodId_PaymentMethod_id_fk" FOREIGN KEY ("paymentMethodId") REFERENCES "public"."PaymentMethod"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyPaymentMethod" ADD CONSTRAINT "CompanyPaymentMethod_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileHoursOfOperation" ADD CONSTRAINT "CompanyProfileHoursOfOperation_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileHoursOfOperation" ADD CONSTRAINT "CompanyProfileHoursOfOperation_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileAlbum" ADD CONSTRAINT "CompanyProfileAlbum_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileAlbum" ADD CONSTRAINT "CompanyProfileAlbum_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileAlbumImage" ADD CONSTRAINT "CompanyProfileAlbumImage_companyProfileAlbumId_CompanyProfileAlbum_id_fk" FOREIGN KEY ("companyProfileAlbumId") REFERENCES "public"."CompanyProfileAlbum"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileAlbumImage" ADD CONSTRAINT "CompanyProfileAlbumImage_image_CompanyDocument_id_fk" FOREIGN KEY ("image") REFERENCES "public"."CompanyDocument"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileAlbumImage" ADD CONSTRAINT "CompanyProfileAlbumImage_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileDocument" ADD CONSTRAINT "CompanyProfileDocument_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileDocument" ADD CONSTRAINT "CompanyProfileDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileDocument" ADD CONSTRAINT "CompanyProfileDocument_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileEmail" ADD CONSTRAINT "CompanyProfileEmail_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileEmail" ADD CONSTRAINT "CompanyProfileEmail_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileInfoList" ADD CONSTRAINT "CompanyProfileInfoList_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileInfoList" ADD CONSTRAINT "CompanyProfileInfoList_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileInfoListItem" ADD CONSTRAINT "CompanyProfileInfoListItem_companyProfilInfoListId_CompanyProfileInfoList_id_fk" FOREIGN KEY ("companyProfilInfoListId") REFERENCES "public"."CompanyProfileInfoList"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileInfoListItem" ADD CONSTRAINT "CompanyProfileInfoListItem_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileLocation" ADD CONSTRAINT "CompanyProfileLocation_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileLocation" ADD CONSTRAINT "CompanyProfileLocation_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfilePhoneNumber" ADD CONSTRAINT "CompanyProfilePhoneNumber_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfilePhoneNumber" ADD CONSTRAINT "CompanyProfilePhoneNumber_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileWebsite" ADD CONSTRAINT "CompanyProfileWebsite_companyProfileId_CompanyProfile_id_fk" FOREIGN KEY ("companyProfileId") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfileWebsite" ADD CONSTRAINT "CompanyProfileWebsite_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" DROP COLUMN "profile";--> statement-breakpoint
ALTER TABLE "CompanyProfile" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_companyId_unique" UNIQUE("companyId");