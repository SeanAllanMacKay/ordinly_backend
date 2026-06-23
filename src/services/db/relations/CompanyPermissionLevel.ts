import { relations } from "drizzle-orm";
import {
  CompanyPermission,
  CompanyPermissionLevel,
  CompanyRolePermission,
} from "../schemas/index.js";

export const CompanyPermissionLevelRelations = relations(
  CompanyPermissionLevel,
  ({ one, many }) => ({
    permission: one(CompanyPermission, {
      fields: [CompanyPermissionLevel.permissionId],
      references: [CompanyPermission.id],
    }),
    assignments: many(CompanyRolePermission),
  }),
);
