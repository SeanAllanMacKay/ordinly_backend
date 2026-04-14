import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Document } from "./Document.js";

export const Company = pgTable("Company", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  logo: uuid().references(() => Document.id),
  owner: uuid()
    .references(() => User.id)
    .notNull(),
  isPersonal: boolean().notNull().default(false),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
