import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { ProjectStatus } from "./ProjectStatus";
import { ProjectPriority } from "./ProjectPriority";
import { User } from "./User";

export const Project = pgTable("Project", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text(),
  status: uuid().references(() => ProjectStatus.id),
  priority: uuid().references(() => ProjectPriority.id),
  startDate: timestamp(),
  dueDate: timestamp(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
