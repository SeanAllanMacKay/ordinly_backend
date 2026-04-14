import { pgTable, uuid, timestamp, time, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfileInfoList = pgTable("CompanyProfileInfoList", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  name: text().notNull(),
  description: text(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
