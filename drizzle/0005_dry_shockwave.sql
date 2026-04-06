ALTER TABLE "Project" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Project" ALTER COLUMN "priority" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Task" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Task" ALTER COLUMN "priority" DROP NOT NULL;