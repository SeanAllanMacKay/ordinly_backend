import { relations } from "drizzle-orm";
import { ProjectRole, ProjectRolePermission } from "../schemas/index.js";

export const ProjectRolePermissionRelations = relations(
  ProjectRolePermission,
  ({ one }) => ({
    role: one(ProjectRole, {
      fields: [ProjectRolePermission.roleId],
      references: [ProjectRole.id],
    }),
  }),
);
