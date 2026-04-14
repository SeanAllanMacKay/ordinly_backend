import { pgTable, uuid, text, date } from "drizzle-orm/pg-core";
import { Company } from "./Company.js";

export const CompanyProfile = pgTable("CompanyProfile", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .unique()
    .notNull(),
  description: text(),
  establishedDate: date(),
});
