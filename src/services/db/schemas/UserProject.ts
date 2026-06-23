import { pgTable, uuid, timestamp, foreignKey, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Project } from "./Project.js";
import { UserCompany } from "./UserCompany.js";

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
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // A worker can only be assigned under a company they're a member of
    userCompanyFk: foreignKey({
      columns: [table.userId, table.companyId],
      foreignColumns: [UserCompany.userId, UserCompany.companyId],
      name: "user_project_user_company_fk",
    }),
    userProjectUserIdx: index("user_project_user_idx").on(table.userId),
    userProjectProjectIdx: index("user_project_project_idx").on(
      table.projectId,
    ),
    userProjectCompanyIdx: index("user_project_company_idx").on(
      table.companyId,
    ),
  }),
);
