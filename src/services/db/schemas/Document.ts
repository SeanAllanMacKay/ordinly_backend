import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { User } from "./User.js";

export const Document = pgTable("Document", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text(),
  externalId: text().notNull(),
  externalPath: text().notNull(),
  isPublic: boolean().default(false).notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
