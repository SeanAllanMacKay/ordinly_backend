import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { Client } from "./Client";
import { Project } from "./Project";
import { User } from "./User";

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
