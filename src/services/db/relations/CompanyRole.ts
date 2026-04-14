import { relations } from "drizzle-orm";
import {
  CompanyRole,
  CompanyRolePermission,
  UserCompanyRole,
} from "../schemas/index.js";

export const CompanyRoleRelations = relations(CompanyRole, ({ many }) => ({
  permissions: many(CompanyRolePermission),
  users: many(UserCompanyRole),
}));
