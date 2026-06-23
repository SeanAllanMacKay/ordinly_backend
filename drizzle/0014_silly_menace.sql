CREATE TABLE "Country" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text,
	"name" text,
	CONSTRAINT "Country_id_unique" UNIQUE("id"),
	CONSTRAINT "Country_code_unique" UNIQUE("code"),
	CONSTRAINT "Country_name_unique" UNIQUE("name")
);
