import { relations } from "drizzle-orm";
import { CompanyProject, Company, User, Project } from "../schemas";

export const CompanyProjectRelations = relations(CompanyProject, ({ one }) => ({
  company: one(Company, {
    fields: [CompanyProject.companyId],
    references: [Company.id],
  }),
  project: one(Project, {
    fields: [CompanyProject.projectId],
    references: [Project.id],
  }),
  assignedBy: one(User, {
    fields: [CompanyProject.assignedBy],
    references: [User.id],
  }),
}));
