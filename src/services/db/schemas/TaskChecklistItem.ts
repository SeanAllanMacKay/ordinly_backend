import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Task } from "./Task.js";

export const TaskChecklistItem = pgTable("TaskChecklistItem", {
  id: uuid().defaultRandom().unique().primaryKey(),
  taskId: uuid()
    .references(() => Task.id)
    .notNull(),
  name: text().notNull(),
  isComplete: boolean().default(false).notNull(),
  order: integer().notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
