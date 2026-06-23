import { relations } from "drizzle-orm";
import {
  ProjectRole,
  ProjectPermission,
  ProjectPermissionLevel,
  ProjectRolePermission,
} from "../schemas/index.js";

export const ProjectRolePermissionRelations = relations(
  ProjectRolePermission,
  ({ one }) => ({
    role: one(ProjectRole, {
      fields: [ProjectRolePermission.roleId],
      references: [ProjectRole.id],
    }),
    permission: one(ProjectPermission, {
      fields: [ProjectRolePermission.permissionId],
      references: [ProjectPermission.id],
    }),
    level: one(ProjectPermissionLevel, {
      fields: [ProjectRolePermission.levelId],
      references: [ProjectPermissionLevel.id],
    }),
  }),
);
