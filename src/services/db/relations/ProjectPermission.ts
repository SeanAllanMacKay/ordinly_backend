import { relations } from "drizzle-orm";
import {
  ProjectPermission,
  ProjectPermissionLevel,
  ProjectRolePermission,
} from "../schemas/index.js";

export const ProjectPermissionRelations = relations(
  ProjectPermission,
  ({ many }) => ({
    levels: many(ProjectPermissionLevel),
    assignments: many(ProjectRolePermission),
  }),
);
