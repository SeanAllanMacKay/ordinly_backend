import { relations } from "drizzle-orm";
import {
  CompanyProjectRole,
  ProjectRole,
  ProjectRolePermission,
} from "../schemas/index.js";

export const ProjectRoleRelations = relations(ProjectRole, ({ many }) => ({
  permissions: many(ProjectRolePermission),
  companies: many(CompanyProjectRole),
}));
