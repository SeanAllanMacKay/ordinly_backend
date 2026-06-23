import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Company } from "./Company.js";

export const Team = pgTable("Team", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  name: text().notNull(),
  description: text(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
