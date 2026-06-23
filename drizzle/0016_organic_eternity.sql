CREATE TABLE "ProjectLocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"name" text,
	"type" "location_type" NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	CONSTRAINT "ProjectLocation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DROP TABLE "Country" CASCADE;--> statement-breakpoint
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;