CREATE TYPE "public"."company_permission_action" AS ENUM('company', 'profile', 'workers', 'roles', 'documents', 'folders', 'invoices', 'license_numbers', 'all_clients', 'all_projects', 'all_tasks', 'all_checklist_items', 'assigned_projects', 'assigned_tasks', 'assigned_clients', 'assigned_checklist_items', 'project_documents', 'task_documents', 'checklist_item_documents');--> statement-breakpoint
CREATE TYPE "public"."project_permission_action" AS ENUM('invoices', 'project_documents', 'all_tasks', 'assigned_tasks', 'task_documents', 'all_checklist_items', 'assigned_checklist_items', 'checklist_item_documents');--> statement-breakpoint
CREATE TABLE "CompanyRole" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid,
	"name" text NOT NULL,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "CompanyRole_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyRolePermission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleId" uuid,
	"asset" "company_permission_action" NOT NULL,
	"create" boolean DEFAULT false NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"update" boolean DEFAULT false NOT NULL,
	"delete" boolean DEFAULT false NOT NULL,
	CONSTRAINT "CompanyRolePermission_roleId_asset_unique" UNIQUE("roleId","asset")
);
--> statement-breakpoint
CREATE TABLE "UserCompanyRole" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userCompanyId" uuid NOT NULL,
	"roleId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectRole" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid,
	"name" text NOT NULL,
	"description" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "ProjectRole_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectRolePermission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleId" uuid,
	"asset" "project_permission_action" NOT NULL,
	"create" boolean DEFAULT false NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"update" boolean DEFAULT false NOT NULL,
	"delete" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ProjectRolePermission_roleId_asset_unique" UNIQUE("roleId","asset")
);
--> statement-breakpoint
CREATE TABLE "CompanyProjectRole" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyProjectId" uuid NOT NULL,
	"roleId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Company" ADD COLUMN "logo" uuid;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyRole" ADD CONSTRAINT "CompanyRole_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRole" ADD CONSTRAINT "CompanyRole_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRole" ADD CONSTRAINT "CompanyRole_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_roleId_CompanyRole_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."CompanyRole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_userCompanyId_UserCompany_id_fk" FOREIGN KEY ("userCompanyId") REFERENCES "public"."UserCompany"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanyRole" ADD CONSTRAINT "UserCompanyRole_roleId_CompanyRole_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."CompanyRole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_roleId_ProjectRole_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."ProjectRole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD CONSTRAINT "CompanyProjectRole_companyProjectId_CompanyProject_id_fk" FOREIGN KEY ("companyProjectId") REFERENCES "public"."CompanyProject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProjectRole" ADD CONSTRAINT "CompanyProjectRole_roleId_ProjectRole_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."ProjectRole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "worker_role_idx" ON "UserCompanyRole" USING btree ("userCompanyId","roleId");--> statement-breakpoint
CREATE UNIQUE INDEX "company_project_role_idx" ON "CompanyProjectRole" USING btree ("companyProjectId","roleId");--> statement-breakpoint
ALTER TABLE "Company" ADD CONSTRAINT "Company_logo_Document_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" DROP COLUMN "description";