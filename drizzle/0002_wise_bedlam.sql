CREATE TABLE "UserClient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"clientId" uuid NOT NULL,
	"assignedDate" timestamp DEFAULT now() NOT NULL,
	"assignedBy" uuid NOT NULL,
	CONSTRAINT "UserClient_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "UserDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	CONSTRAINT "UserDocument_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "CompanyClient" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ProjectTask" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "CompanyClient" CASCADE;--> statement-breakpoint
DROP TABLE "ProjectTask" CASCADE;--> statement-breakpoint
ALTER TABLE "Client" RENAME COLUMN "userId" TO "clientUserId";--> statement-breakpoint
ALTER TABLE "UserCompany" DROP CONSTRAINT "UserCompany_id_unique";--> statement-breakpoint
ALTER TABLE "Client" DROP CONSTRAINT "name_or_clientCompanyId_or_userId";--> statement-breakpoint
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_projectId_Project_id_fk";
--> statement-breakpoint
ALTER TABLE "Client" ALTER COLUMN "companyId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "UserProject" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "projectId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserClient" ADD CONSTRAINT "UserClient_assignedBy_User_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_clientUserId_User_id_fk" FOREIGN KEY ("clientUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompany" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "UserTask" DROP COLUMN "projectId";