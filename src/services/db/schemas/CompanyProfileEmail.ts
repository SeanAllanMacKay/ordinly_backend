import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfileEmail = pgTable("CompanyProfileEmail", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  email: text().notNull(),
  description: text(),
  type: text(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
