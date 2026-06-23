import { relations } from "drizzle-orm";
import {
  CompanyRole,
  CompanyPermission,
  CompanyPermissionLevel,
  CompanyRolePermission,
} from "../schemas/index.js";

export const CompanyRolePermissionRelations = relations(
  CompanyRolePermission,
  ({ one }) => ({
    role: one(CompanyRole, {
      fields: [CompanyRolePermission.roleId],
      references: [CompanyRole.id],
    }),
    permission: one(CompanyPermission, {
      fields: [CompanyRolePermission.permissionId],
      references: [CompanyPermission.id],
    }),
    level: one(CompanyPermissionLevel, {
      fields: [CompanyRolePermission.levelId],
      references: [CompanyPermissionLevel.id],
    }),
  }),
);
