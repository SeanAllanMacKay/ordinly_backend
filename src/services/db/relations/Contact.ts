import { relations } from "drizzle-orm";

import {
  Contact,
  Company,
  Client,
  User,
  ProjectContact,
} from "../schemas/index.js";

export const ContactRelations = relations(Contact, ({ one, many }) => ({
  company: one(Company, {
    fields: [Contact.companyId],
    references: [Company.id],
  }),
  client: one(Client, {
    fields: [Contact.clientId],
    references: [Client.id],
  }),
  createdBy: one(User, {
    fields: [Contact.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Contact.deletedBy],
    references: [User.id],
  }),

  projects: many(ProjectContact, {
    relationName: "contact_to_projectContact",
  }),
}));
