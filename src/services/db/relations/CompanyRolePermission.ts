import { relations } from "drizzle-orm";
import { CompanyRole, CompanyRolePermission } from "../schemas/index.js";

export const CompanyRolePermissionRelations = relations(
  CompanyRolePermission,
  ({ one }) => ({
    role: one(CompanyRole, {
      fields: [CompanyRolePermission.roleId],
      references: [CompanyRole.id],
    }),
  }),
);
