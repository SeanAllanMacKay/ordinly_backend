import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfileWebsite = pgTable("CompanyProfileWebsite", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  url: text().notNull(),
  description: text(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
