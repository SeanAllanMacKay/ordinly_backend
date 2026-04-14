import { pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { UserCompany } from "./UserCompany.js";
import { CompanyRole } from "./CompanyRole.js";

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
  },
  (table) => ({
    // Ensure a worker can't be assigned the same role twice
    workerRoleIndex: uniqueIndex("worker_role_idx").on(
      table.userCompanyId,
      table.roleId,
    ),
  }),
);
