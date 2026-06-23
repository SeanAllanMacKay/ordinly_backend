ALTER TABLE "ProjectStatus" ADD COLUMN "isTerminal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "TaskStatus" ADD COLUMN "isTerminal" boolean DEFAULT false NOT NULL;