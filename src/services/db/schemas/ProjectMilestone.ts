import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Project } from "./Project.js";

export const ProjectMilestone = pgTable("ProjectMilestone", {
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  name: text().notNull(),
  description: text(),
  isComplate: boolean().default(false).notNull(),
  startDate: timestamp(),
  dueDate: timestamp(),
  completionDate: timestamp(),

  createdDate: timestamp().defaultNow().notNull(),
  updatedDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
