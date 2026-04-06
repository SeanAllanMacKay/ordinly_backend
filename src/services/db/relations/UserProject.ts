import { relations, sql } from "drizzle-orm";
import { Company, Project, User, UserProject } from "../schemas";

export const UserProjectRelations = relations(UserProject, ({ one }) => ({
  user: one(User, {
    fields: [UserProject.userId],
    references: [User.id],
    relationName: "user_to_userProject",
  }),
  project: one(Project, {
    fields: [UserProject.projectId],
    references: [Project.id],
    relationName: "project_to_userProject",
  }),
  company: one(Company, {
    fields: [UserProject.companyId],
    references: [Company.id],
  }),
  assignedBy: one(User, {
    fields: [UserProject.assignedBy],
    references: [User.id],
  }),
}));
