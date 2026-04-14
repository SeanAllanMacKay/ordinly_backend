import { pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { CompanyProject } from "./CompanyProject.js";
import { ProjectRole } from "./ProjectRole.js";

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
  },
  (table) => ({
    workerRoleIndex: uniqueIndex("company_project_role_idx").on(
      table.companyProjectId,
      table.roleId,
    ),
  }),
);
