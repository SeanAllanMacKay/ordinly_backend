ALTER TYPE "public"."project_permission_action" ADD VALUE 'project_roles' BEFORE 'project_documents';--> statement-breakpoint
CREATE TABLE "CompanyTask" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "CompanyTask_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "UserProject" DROP CONSTRAINT "name_or_clientCompanyId_or_userId";--> statement-breakpoint
ALTER TABLE "UserProject" ALTER COLUMN "companyId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ALTER COLUMN "roleId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "createdDate" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "createdBy" uuid;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "deletedDate" timestamp;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "deletedBy" uuid;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD COLUMN "assignedDate" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD COLUMN "assignedBy" uuid;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD COLUMN "deletedDate" timestamp;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD COLUMN "deletedBy" uuid;--> statement-breakpoint
ALTER TABLE "ProjectRole" ADD COLUMN "companyId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "createdDate" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "createdBy" uuid;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "deletedDate" timestamp;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "deletedBy" uuid;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD COLUMN "assignedDate" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD COLUMN "assignedBy" uuid;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD COLUMN "deletedDate" timestamp;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD COLUMN "deletedBy" uuid;--> statement-breakpoint
ALTER TABLE "CompanyTask" ADD CONSTRAINT "CompanyTask_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyTask" ADD CONSTRAINT "CompanyTask_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyTask" ADD CONSTRAINT "CompanyTask_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyTask" ADD CONSTRAINT "CompanyTask_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_task_idx" ON "CompanyTask" USING btree ("companyId","taskId");--> statement-breakpoint
CREATE INDEX "company_task_task_idx" ON "CompanyTask" USING btree ("taskId");--> statement-breakpoint
ALTER TABLE "UserCompany" ADD CONSTRAINT "user_company_unique" UNIQUE("userId","companyId");--> statement-breakpoint
ALTER TABLE "UserProject" ADD CONSTRAINT "user_project_user_company_fk" FOREIGN KEY ("userId","companyId") REFERENCES "public"."UserCompany"("userId","companyId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "user_task_user_company_fk" FOREIGN KEY ("userId","companyId") REFERENCES "public"."UserCompany"("userId","companyId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD CONSTRAINT "CompanyProjectRole_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD CONSTRAINT "CompanyProjectRole_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_project_company_idx" ON "CompanyProject" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "company_project_project_idx" ON "CompanyProject" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "user_company_company_idx" ON "UserCompany" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "user_project_user_idx" ON "UserProject" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_project_project_idx" ON "UserProject" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "user_project_company_idx" ON "UserProject" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "user_task_user_idx" ON "UserTask" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_task_task_idx" ON "UserTask" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "user_task_company_idx" ON "UserTask" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "user_company_role_role_idx" ON "UserCompanyRole" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "project_role_project_idx" ON "ProjectRole" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_role_company_idx" ON "ProjectRole" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "company_project_role_role_idx" ON "CompanyProjectRole" USING btree ("roleId");