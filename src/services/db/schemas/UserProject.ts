import { pgTable, uuid, timestamp, check } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { User } from "./User";
import { Project } from "./Project";
import { sql } from "drizzle-orm";

export const UserProject = pgTable(
  "UserProject",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    userId: uuid()
      .references(() => User.id)
      .notNull(),
    projectId: uuid()
      .references(() => Project.id)
      .notNull(),
    companyId: uuid().references(() => Company.id),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => [
    check(
      "name_or_clientCompanyId_or_userId",
      sql`${table.userId} IS NOT NULL AND ${table.companyId} IS NULL OR ${table.companyId} IS NOT NULL AND ${table.userId} IS NULL`,
    ),
  ],
);
