CREATE TABLE "Client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"description" text,
	"companyId" uuid,
	"clientCompanyId" uuid,
	"userId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Client_id_unique" UNIQUE("id"),
	CONSTRAINT "name_or_clientCompanyId_or_userId" CHECK ("Client"."clientCompanyId" IS NOT NULL AND "Client"."name" IS NULL AND "Client"."description" IS NULL AND "Client"."userId" IS NULL OR "Client"."name" IS NOT NULL AND "Client"."clientCompanyId" IS NULL AND "Client"."userId" IS NULL OR "Client"."userId" IS NOT NULL AND "Client"."clientCompanyId" IS NULL AND "Client"."name" IS NULL AND "Client"."description" IS NULL)
);
--> statement-breakpoint
CREATE TABLE "Company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"profile" uuid NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Company_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyClient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"clientId" uuid NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyClient_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"createdDate" timestamp NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "CompanyDocument_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProfile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "CompanyProfile_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyProject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"isOwner" boolean NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	CONSTRAINT "CompanyProject_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanyStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "CompanyStatus_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "CompanySubscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"isActive" boolean NOT NULL,
	"externalSubscriptionId" text,
	"externalCustomerId" text,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "CompanySubscription_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"size" integer NOT NULL,
	"externalId" text NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Document_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" uuid NOT NULL,
	"priority" uuid NOT NULL,
	"startDate" timestamp,
	"dueDate" timestamp,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Project_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectClient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ProjectClient_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ProjectDocument_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectPriority" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "ProjectPriority_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "ProjectStatus_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectTask" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "ProjectTask_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" uuid NOT NULL,
	"priority" uuid NOT NULL,
	"startDate" timestamp,
	"dueDate" timestamp,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "Task_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TaskDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "TaskDocument_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TaskPriority" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "TaskPriority_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TaskStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"companyId" uuid,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "TaskStatus_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"isVerified" boolean,
	"verificationCode" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"deletedDate" timestamp,
	CONSTRAINT "User_id_unique" UNIQUE("id"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "UserCompany" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	CONSTRAINT "UserCompany_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "UserProject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"projectId" uuid NOT NULL,
	"companyId" uuid,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	CONSTRAINT "UserProject_id_unique" UNIQUE("id"),
	CONSTRAINT "name_or_clientCompanyId_or_userId" CHECK ("UserProject"."userId" IS NOT NULL AND "UserProject"."companyId" IS NULL OR "UserProject"."companyId" IS NOT NULL AND "UserProject"."userId" IS NULL)
);
--> statement-breakpoint
CREATE TABLE "UserTask" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	CONSTRAINT "UserTask_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_clientCompanyId_Company_id_fk" FOREIGN KEY ("clientCompanyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" ADD CONSTRAINT "Company_owner_User_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" ADD CONSTRAINT "Company_profile_CompanyProfile_id_fk" FOREIGN KEY ("profile") REFERENCES "public"."CompanyProfile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Company" ADD CONSTRAINT "Company_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyClient" ADD CONSTRAINT "CompanyClient_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyClient" ADD CONSTRAINT "CompanyClient_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyClient" ADD CONSTRAINT "CompanyClient_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProject" ADD CONSTRAINT "CompanyProject_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProject" ADD CONSTRAINT "CompanyProject_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyProject" ADD CONSTRAINT "CompanyProject_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyStatus" ADD CONSTRAINT "CompanyStatus_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyStatus" ADD CONSTRAINT "CompanyStatus_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_status_ProjectStatus_id_fk" FOREIGN KEY ("status") REFERENCES "public"."ProjectStatus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_priority_ProjectPriority_id_fk" FOREIGN KEY ("priority") REFERENCES "public"."ProjectPriority"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectClient" ADD CONSTRAINT "ProjectClient_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectClient" ADD CONSTRAINT "ProjectClient_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectClient" ADD CONSTRAINT "ProjectClient_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectClient" ADD CONSTRAINT "ProjectClient_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectPriority" ADD CONSTRAINT "ProjectPriority_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectPriority" ADD CONSTRAINT "ProjectPriority_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectPriority" ADD CONSTRAINT "ProjectPriority_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_status_TaskStatus_id_fk" FOREIGN KEY ("status") REFERENCES "public"."TaskStatus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_priority_TaskPriority_id_fk" FOREIGN KEY ("priority") REFERENCES "public"."TaskPriority"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskPriority" ADD CONSTRAINT "TaskPriority_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskPriority" ADD CONSTRAINT "TaskPriority_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskPriority" ADD CONSTRAINT "TaskPriority_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;