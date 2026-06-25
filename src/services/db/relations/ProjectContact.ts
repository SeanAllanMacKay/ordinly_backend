import { relations } from "drizzle-orm";
import {
  ProjectContact,
  Company,
  Contact,
  Project,
  User,
} from "../schemas/index.js";

export const ProjectContactRelations = relations(ProjectContact, ({ one }) => ({
  contact: one(Contact, {
    fields: [ProjectContact.contactId],
    references: [Contact.id],
    relationName: "contact_to_projectContact",
  }),
  project: one(Project, {
    fields: [ProjectContact.projectId],
    references: [Project.id],
    relationName: "project_to_projectContact",
  }),
  company: one(Company, {
    fields: [ProjectContact.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [ProjectContact.createdBy],
    references: [User.id],
  }),
}));
