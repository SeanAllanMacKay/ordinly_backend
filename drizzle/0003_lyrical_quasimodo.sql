CREATE TABLE "TaskChecklistItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"name" text NOT NULL,
	"isComplete" boolean DEFAULT false NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL,
	"deletedDate" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "TaskChecklistItem_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "TaskChecklistItem" ADD CONSTRAINT "TaskChecklistItem_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskChecklistItem" ADD CONSTRAINT "TaskChecklistItem_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskChecklistItem" ADD CONSTRAINT "TaskChecklistItem_deletedBy_User_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;