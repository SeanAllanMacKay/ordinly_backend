CREATE TABLE "Reminder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"targetType" text,
	"targetId" uuid,
	"title" text NOT NULL,
	"body" text,
	"remindAt" timestamp NOT NULL,
	"channels" jsonb NOT NULL,
	"recipientUserIds" jsonb NOT NULL,
	"recurrence" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"jobId" text,
	"firedDate" timestamp,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"updatedDate" timestamp,
	"updatedBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Reminder_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"data" jsonb,
	"readDate" timestamp,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Notification_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "NotificationDelivery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceType" text NOT NULL,
	"sourceId" text NOT NULL,
	"channel" text NOT NULL,
	"recipientUserId" uuid NOT NULL,
	"recipientAddress" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lastError" text,
	"sentDate" timestamp,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"updatedDate" timestamp,
	CONSTRAINT "NotificationDelivery_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_updatedBy_User_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_recipientUserId_User_id_fk" FOREIGN KEY ("recipientUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reminder_company_idx" ON "Reminder" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "reminder_due_idx" ON "Reminder" USING btree ("status","remindAt");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "Notification" USING btree ("userId","readDate");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_source_channel_recipient_idx" ON "NotificationDelivery" USING btree ("sourceType","sourceId","channel","recipientUserId");