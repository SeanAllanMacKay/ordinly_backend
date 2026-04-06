import { relations } from "drizzle-orm";

import { Client, Company, User, ProjectClient, UserClient } from "../schemas";

export const ClientRelations = relations(Client, ({ one, many }) => ({
  company: one(Company, {
    fields: [Client.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [Client.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Client.deletedBy],
    references: [User.id],
  }),
  clientUser: one(User, {
    fields: [Client.clientUserId],
    references: [User.id],
  }),
  clientCompany: one(Company, {
    fields: [Client.clientCompanyId],
    references: [Company.id],
  }),

  projects: many(ProjectClient, { relationName: "client_to_projectClient" }),
  users: many(UserClient, { relationName: "client_to_userClient" }),
}));
