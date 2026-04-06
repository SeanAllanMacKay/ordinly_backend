import { relations } from "drizzle-orm";

import {
  Document,
  User,
  UserDocument,
  CompanyDocument,
  ProjectDocument,
  TaskDocument,
} from "../schemas";

export const DocumentRelations = relations(Document, ({ one, many }) => ({
  createdBy: one(User, {
    fields: [Document.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Document.deletedBy],
    references: [User.id],
  }),

  users: many(UserDocument, { relationName: "document_to_userDocument" }),
  companies: many(CompanyDocument, {
    relationName: "document_to_companyDocument",
  }),
  project: many(ProjectDocument, {
    relationName: "document_to_projectDocument",
  }),
  tasks: many(TaskDocument, { relationName: "document_to_taskDocument" }),
}));
