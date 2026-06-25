CREATE TABLE "ProjectTeam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ProjectTeam_id_unique" UNIQUE("id"),
	CONSTRAINT "project_team_unique" UNIQUE("projectId","teamId")
);
--> statement-breakpoint
CREATE TABLE "ClientTeam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"clientId" uuid NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ClientTeam_id_unique" UNIQUE("id"),
	CONSTRAINT "client_team_unique" UNIQUE("clientId","teamId")
);
--> statement-breakpoint
CREATE TABLE "TaskTeam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "TaskTeam_id_unique" UNIQUE("id"),
	CONSTRAINT "task_team_unique" UNIQUE("taskId","teamId")
);
--> statement-breakpoint
ALTER TABLE "UserClient" ADD COLUMN "companyId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClientTeam" ADD CONSTRAINT "ClientTeam_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClientTeam" ADD CONSTRAINT "ClientTeam_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClientTeam" ADD CONSTRAINT "ClientTeam_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClientTeam" ADD CONSTRAINT "ClientTeam_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_team_project_idx" ON "ProjectTeam" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_team_team_idx" ON "ProjectTeam" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "client_team_client_idx" ON "ClientTeam" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "client_team_team_idx" ON "ClientTeam" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "task_team_task_idx" ON "TaskTeam" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "task_team_team_idx" ON "TaskTeam" USING btree ("teamId");--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "user_client_user_company_fk" FOREIGN KEY ("userId","companyId") REFERENCES "public"."UserCompany"("userId","companyId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_client_user_idx" ON "UserClient" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_client_client_idx" ON "UserClient" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "user_client_company_idx" ON "UserClient" USING btree ("companyId");--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "user_client_unique" UNIQUE("clientId","userId");