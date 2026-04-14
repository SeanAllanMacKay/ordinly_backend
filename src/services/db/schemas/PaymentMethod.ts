import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";

export const PaymentMethod = pgTable("PaymentMethod", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  logoURL: text().notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
