CREATE TABLE "CompanyPermission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CompanyPermission_id_unique" UNIQUE("id"),
	CONSTRAINT "CompanyPermission_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "CompanyPermissionLevel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"permissionId" uuid NOT NULL,
	"value" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"create" boolean DEFAULT false NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"update" boolean DEFAULT false NOT NULL,
	"delete" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CompanyPermissionLevel_id_unique" UNIQUE("id"),
	CONSTRAINT "CompanyPermissionLevel_permissionId_value_unique" UNIQUE("permissionId","value")
);
--> statement-breakpoint
CREATE TABLE "ProjectPermission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProjectPermission_id_unique" UNIQUE("id"),
	CONSTRAINT "ProjectPermission_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ProjectPermissionLevel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"permissionId" uuid NOT NULL,
	"value" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"create" boolean DEFAULT false NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"update" boolean DEFAULT false NOT NULL,
	"delete" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProjectPermissionLevel_id_unique" UNIQUE("id"),
	CONSTRAINT "ProjectPermissionLevel_permissionId_value_unique" UNIQUE("permissionId","value")
);
--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP CONSTRAINT "CompanyRolePermission_roleId_asset_unique";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP CONSTRAINT "ProjectRolePermission_roleId_asset_unique";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "permissionId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD COLUMN "levelId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "permissionId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD COLUMN "levelId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "CompanyPermissionLevel" ADD CONSTRAINT "CompanyPermissionLevel_permissionId_CompanyPermission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."CompanyPermission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectPermissionLevel" ADD CONSTRAINT "ProjectPermissionLevel_permissionId_ProjectPermission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."ProjectPermission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_permissionId_CompanyPermission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."CompanyPermission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_levelId_CompanyPermissionLevel_id_fk" FOREIGN KEY ("levelId") REFERENCES "public"."CompanyPermissionLevel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_permissionId_ProjectPermission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."ProjectPermission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_levelId_ProjectPermissionLevel_id_fk" FOREIGN KEY ("levelId") REFERENCES "public"."ProjectPermissionLevel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP COLUMN "asset";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP COLUMN "create";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP COLUMN "read";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP COLUMN "update";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" DROP COLUMN "delete";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP COLUMN "asset";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP COLUMN "create";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP COLUMN "read";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP COLUMN "update";--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" DROP COLUMN "delete";--> statement-breakpoint
ALTER TABLE "CompanyRolePermission" ADD CONSTRAINT "CompanyRolePermission_roleId_permissionId_unique" UNIQUE("roleId","permissionId");--> statement-breakpoint
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_roleId_permissionId_unique" UNIQUE("roleId","permissionId");--> statement-breakpoint
DROP TYPE "public"."company_permission_action";--> statement-breakpoint
DROP TYPE "public"."project_permission_action";