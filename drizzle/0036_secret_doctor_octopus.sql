ALTER TABLE "Client" ADD COLUMN "profilePicture" uuid;--> statement-breakpoint
ALTER TABLE "Contact" ADD COLUMN "profilePicture" uuid;--> statement-breakpoint
ALTER TABLE "Client" ADD CONSTRAINT "Client_profilePicture_Document_id_fk" FOREIGN KEY ("profilePicture") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_profilePicture_Document_id_fk" FOREIGN KEY ("profilePicture") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;