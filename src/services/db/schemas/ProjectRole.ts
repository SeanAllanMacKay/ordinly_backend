import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Project } from "./Project.js";

export const ProjectRole = pgTable("ProjectRole", {
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid().references(() => Project.id),
  name: text().notNull(),
  description: text(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
