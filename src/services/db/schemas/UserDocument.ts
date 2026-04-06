import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Document } from "./Document";
import { User } from "./User";

export const UserDocument = pgTable("UserDocument", {
  id: uuid().defaultRandom().unique().primaryKey(),
  userId: uuid()
    .references(() => User.id)
    .notNull(),
  documentId: uuid()
    .references(() => Document.id)
    .notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
