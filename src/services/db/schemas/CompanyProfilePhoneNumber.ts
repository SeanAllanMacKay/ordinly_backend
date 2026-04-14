import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfilePhoneNumber = pgTable("CompanyProfilePhoneNumber", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  number: text().notNull(),
  type: text(),
  description: text(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
