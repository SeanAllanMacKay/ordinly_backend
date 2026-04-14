import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Task } from "./Task.js";

export const UserTask = pgTable("UserTask", {
  id: uuid().defaultRandom().unique().primaryKey(),
  userId: uuid()
    .references(() => User.id)
    .notNull(),
  taskId: uuid()
    .references(() => Task.id)
    .notNull(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),

  assignedDate: timestamp().defaultNow().notNull(),
  assignedBy: uuid()
    .references(() => User.id)
    .notNull(),
});
