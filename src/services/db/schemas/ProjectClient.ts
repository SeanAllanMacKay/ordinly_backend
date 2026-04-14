import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { Client } from "./Client.js";
import { Project } from "./Project.js";
import { User } from "./User.js";

export const ProjectClient = pgTable("ProjectClient", {
  id: uuid().defaultRandom().unique().primaryKey(),
  clientId: uuid()
    .references(() => Client.id)
    .notNull(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  companyId: uuid().references(() => Company.id),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
