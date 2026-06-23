import { relations } from "drizzle-orm";
import {
  Company,
  CompanyProjectRole,
  ProjectRole,
  ProjectRolePermission,
} from "../schemas/index.js";

export const ProjectRoleRelations = relations(ProjectRole, ({ one, many }) => ({
  company: one(Company, {
    fields: [ProjectRole.companyId],
    references: [Company.id],
  }),
  permissions: many(ProjectRolePermission),
  companies: many(CompanyProjectRole),
}));
