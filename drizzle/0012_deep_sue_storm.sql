ALTER TABLE "Document" ADD COLUMN "externalURL" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" DROP COLUMN "size";