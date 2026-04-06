import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { TaskStatus } from "./TaskStatus";
import { TaskPriority } from "./TaskPriority";
import { User } from "./User";
import { Project } from "./Project";

export const Task = pgTable("Task", {
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  name: text().notNull(),
  description: text(),
  status: uuid().references(() => TaskStatus.id),
  priority: uuid().references(() => TaskPriority.id),
  startDate: timestamp(),
  dueDate: timestamp(),

  createdDate: timestamp().defaultNow().notNull(),
  updatedDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
