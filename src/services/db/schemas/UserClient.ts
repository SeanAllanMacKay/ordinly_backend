import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Client } from "./Client.js";

export const UserClient = pgTable("UserClient", {
  id: uuid().defaultRandom().unique().primaryKey(),
  userId: uuid()
    .references(() => User.id)
    .notNull(),
  clientId: uuid()
    .references(() => Client.id)
    .notNull(),
  assignedDate: timestamp().defaultNow().notNull(),
  assignedBy: uuid()
    .references(() => User.id)
    .notNull(),
});
