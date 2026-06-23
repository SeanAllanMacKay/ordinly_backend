CREATE TYPE "public"."task_type" AS ENUM('phase', 'milestone', 'task');--> statement-breakpoint
CREATE TYPE "public"."task_relationship_type" AS ENUM('references', 'impacts', 'conflicts');--> statement-breakpoint
CREATE TYPE "public"."task_sequence_type" AS ENUM('start-to-start', 'start-to-finish', 'finish-to-start', 'finish-to-finish');--> statement-breakpoint
CREATE TABLE "TaskRelationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromId" uuid NOT NULL,
	"toId" uuid NOT NULL,
	"type" "task_relationship_type" DEFAULT 'references' NOT NULL,
	CONSTRAINT "TaskRelationship_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TaskSequence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"predecessorId" uuid NOT NULL,
	"successorId" uuid NOT NULL,
	"type" "task_sequence_type" DEFAULT 'finish-to-start' NOT NULL,
	"lagOffset" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "TaskSequence_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "parentTaskId" uuid;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "type" "task_type" DEFAULT 'task' NOT NULL;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "approver" uuid;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "isPaymentTrigger" boolean;--> statement-breakpoint
ALTER TABLE "TaskRelationship" ADD CONSTRAINT "TaskRelationship_fromId_Task_id_fk" FOREIGN KEY ("fromId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskRelationship" ADD CONSTRAINT "TaskRelationship_toId_Task_id_fk" FOREIGN KEY ("toId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskSequence" ADD CONSTRAINT "TaskSequence_predecessorId_Task_id_fk" FOREIGN KEY ("predecessorId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaskSequence" ADD CONSTRAINT "TaskSequence_successorId_Task_id_fk" FOREIGN KEY ("successorId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_Task_id_fk" FOREIGN KEY ("parentTaskId") REFERENCES "public"."Task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_approver_User_id_fk" FOREIGN KEY ("approver") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" DROP COLUMN "isMilestone";