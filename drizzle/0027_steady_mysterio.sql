CREATE TABLE "Team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Team_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TeamMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "TeamMember_id_unique" UNIQUE("id"),
	CONSTRAINT "team_member_unique" UNIQUE("teamId","userId")
);
--> statement-breakpoint
CREATE TABLE "CompanyInvitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"email" text NOT NULL,
	"roleId" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invitedDate" timestamp DEFAULT now() NOT NULL,
	"invitedBy" uuid,
	"respondedDate" timestamp,
	CONSTRAINT "CompanyInvitation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "UserCompany" ADD COLUMN "deletedDate" timestamp;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD COLUMN "deletedBy" uuid;--> statement-breakpoint
ALTER TABLE "Team" ADD CONSTRAINT "Team_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Team" ADD CONSTRAINT "Team_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_roleId_CompanyRole_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."CompanyRole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_invitedBy_User_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_member_team_idx" ON "TeamMember" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "team_member_user_idx" ON "TeamMember" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "company_invitation_company_idx" ON "CompanyInvitation" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "company_invitation_email_idx" ON "CompanyInvitation" USING btree ("email");--> statement-breakpoint
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;