import { relations } from "drizzle-orm";
import {
  CompanyProject,
  CompanyProjectRole,
  CompanyRole,
} from "../schemas/index.js";

export const CompanyProjectRoleRelations = relations(
  CompanyProjectRole,
  ({ one }) => ({
    company: one(CompanyProject, {
      fields: [CompanyProjectRole.companyProjectId],
      references: [CompanyProject.id],
    }),
    role: one(CompanyRole, {
      fields: [CompanyProjectRole.roleId],
      references: [CompanyRole.id],
    }),
  }),
);
