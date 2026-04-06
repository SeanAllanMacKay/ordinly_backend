import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const CompanyProfile = pgTable("CompanyProfile", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text(),
});
