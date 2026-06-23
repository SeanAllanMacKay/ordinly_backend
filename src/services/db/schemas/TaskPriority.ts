import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Company } from "./Company.js";

export const TaskPriority = pgTable("TaskPriority", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  color: text().notNull(),
  companyId: uuid().references(() => Company.id),
  isCritical: boolean().notNull().default(false),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
