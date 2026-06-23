import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { ProjectStatus } from "./ProjectStatus.js";
import { ProjectPriority } from "./ProjectPriority.js";
import { User } from "./User.js";

export const Project = pgTable("Project", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text(),
  shortDescription: text(),
  status: uuid().references(() => ProjectStatus.id),
  priority: uuid().references(() => ProjectPriority.id),
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
