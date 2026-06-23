import {
  pgTable,
  uniqueIndex,
  index,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { UserCompany } from "./UserCompany.js";
import { CompanyRole } from "./CompanyRole.js";
import { User } from "./User.js";

export const UserCompanyRole = pgTable(
  "UserCompanyRole",
  {
    id: uuid().primaryKey().defaultRandom(),
    userCompanyId: uuid()
      .references(() => UserCompany.id)
      .notNull(),
    roleId: uuid()
      .references(() => CompanyRole.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    // Ensure a worker can't be assigned the same role twice
    workerRoleIndex: uniqueIndex("worker_role_idx").on(
      table.userCompanyId,
      table.roleId,
    ),
    userCompanyRoleRoleIdx: index("user_company_role_role_idx").on(
      table.roleId,
    ),
  }),
);
