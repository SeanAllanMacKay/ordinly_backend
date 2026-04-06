import { relations } from "drizzle-orm";
import { ProjectClient, Company, Client, Project, User } from "../schemas";

export const ProjectClientRelations = relations(ProjectClient, ({ one }) => ({
  client: one(Client, {
    fields: [ProjectClient.clientId],
    references: [Client.id],
    relationName: "client_to_projectClient",
  }),
  project: one(Project, {
    fields: [ProjectClient.projectId],
    references: [Project.id],
    relationName: "project_to_projectClient",
  }),
  company: one(Company, {
    fields: [ProjectClient.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [ProjectClient.createdBy],
    references: [User.id],
  }),
}));
