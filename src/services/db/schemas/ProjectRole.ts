import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Project } from "./Project.js";
import { Company } from "./Company.js";

export const ProjectRole = pgTable(
  "ProjectRole",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    projectId: uuid().references(() => Project.id),
    // Owning/authoring company — scopes the role to a tenant so reusable roles
    // and "list this company's project roles" don't leak across companies.
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    name: text().notNull(),
    description: text(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    projectRoleProjectIdx: index("project_role_project_idx").on(
      table.projectId,
    ),
    projectRoleCompanyIdx: index("project_role_company_idx").on(
      table.companyId,
    ),
  }),
);
