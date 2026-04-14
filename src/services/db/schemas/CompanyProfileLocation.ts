import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfileLocation = pgTable("CompanyProfileLocation", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  address: text().notNull(),
  zoneIdentifier: text().notNull(),
  city: text().notNull(),
  region: text().notNull(),
  country: text().notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
