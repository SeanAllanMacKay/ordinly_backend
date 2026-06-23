import { relations } from "drizzle-orm";
import {
  ProjectPermission,
  ProjectPermissionLevel,
  ProjectRolePermission,
} from "../schemas/index.js";

export const ProjectPermissionLevelRelations = relations(
  ProjectPermissionLevel,
  ({ one, many }) => ({
    permission: one(ProjectPermission, {
      fields: [ProjectPermissionLevel.permissionId],
      references: [ProjectPermission.id],
    }),
    assignments: many(ProjectRolePermission),
  }),
);
