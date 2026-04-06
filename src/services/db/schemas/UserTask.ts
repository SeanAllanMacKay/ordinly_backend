import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { User } from "./User";
import { Task } from "./Task";

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
