import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";

export const CompanyStatus = pgTable("CompanyStatus", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  color: text().notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
