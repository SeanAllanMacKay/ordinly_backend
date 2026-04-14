import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Project } from "./Project.js";

export const CompanyProject = pgTable("CompanyProject", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  isOwner: boolean().notNull(),

  assignedDate: timestamp().defaultNow().notNull(),
  assignedBy: uuid()
    .references(() => User.id)
    .notNull(),
});
