import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

import { User } from "./User";

export const Document = pgTable("Document", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text(),
  size: integer().notNull(),
  externalId: text().notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
