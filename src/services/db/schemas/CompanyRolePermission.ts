import { boolean, pgEnum, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { companyRolePermissionAction } from "../constants.js";
import { CompanyRole } from "./CompanyRole.js";

export const CompanyRolePermissionActionEnum = pgEnum(
  "company_permission_action",
  companyRolePermissionAction,
);

export const CompanyRolePermission = pgTable(
  "CompanyRolePermission",
  {
    id: uuid().primaryKey().defaultRandom(),
    roleId: uuid()
      .references(() => CompanyRole.id)
      .notNull(),
    asset: CompanyRolePermissionActionEnum().notNull(),
    create: boolean().default(false).notNull(),
    read: boolean().default(false).notNull(),
    update: boolean().default(false).notNull(),
    delete: boolean().default(false).notNull(),
  },
  (table) => ({
    unq: unique().on(table.roleId, table.asset),
  }),
);
