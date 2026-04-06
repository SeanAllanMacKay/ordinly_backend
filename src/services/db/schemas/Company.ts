import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User";
import { CompanyProfile } from "./CompanyProfile";

export const Company = pgTable("Company", {
  id: uuid().defaultRandom().unique().primaryKey(),
  owner: uuid()
    .references(() => User.id)
    .notNull(),
  name: text().notNull(),
  description: text(),
  profile: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
