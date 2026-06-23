import {
  pgTable,
  uniqueIndex,
  index,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { CompanyProject } from "./CompanyProject.js";
import { ProjectRole } from "./ProjectRole.js";
import { User } from "./User.js";

export const CompanyProjectRole = pgTable(
  "CompanyProjectRole",
  {
    id: uuid().primaryKey().defaultRandom(),
    companyProjectId: uuid()
      .references(() => CompanyProject.id)
      .notNull(),
    roleId: uuid()
      .references(() => ProjectRole.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    workerRoleIndex: uniqueIndex("company_project_role_idx").on(
      table.companyProjectId,
      table.roleId,
    ),
    companyProjectRoleRoleIdx: index("company_project_role_role_idx").on(
      table.roleId,
    ),
  }),
);
