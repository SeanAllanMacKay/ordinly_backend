import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User";
import { Company } from "./Company";
import { relations } from "drizzle-orm";

export const ProjectStatus = pgTable("ProjectStatus", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  color: text().notNull(),
  companyId: uuid().references(() => Company.id),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
