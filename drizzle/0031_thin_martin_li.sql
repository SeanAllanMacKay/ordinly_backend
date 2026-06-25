CREATE TABLE "ProjectContact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contactId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ProjectContact_id_unique" UNIQUE("id"),
	CONSTRAINT "project_contact_unique" UNIQUE("projectId","contactId")
);
--> statement-breakpoint
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_contactId_Contact_id_fk" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectContact" ADD CONSTRAINT "ProjectContact_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_contact_project_idx" ON "ProjectContact" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_contact_contact_idx" ON "ProjectContact" USING btree ("contactId");--> statement-breakpoint
CREATE INDEX "project_client_project_idx" ON "ProjectClient" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_client_client_idx" ON "ProjectClient" USING btree ("clientId");--> statement-breakpoint
ALTER TABLE "ProjectClient" ADD CONSTRAINT "project_client_unique" UNIQUE("projectId","clientId");