import { relations } from "drizzle-orm";
import { CompanyDocument, Company, Document, User } from "../schemas";

export const CompanyDocumentRelations = relations(
  CompanyDocument,
  ({ one }) => ({
    company: one(Company, {
      fields: [CompanyDocument.companyId],
      references: [Company.id],
      relationName: "company_to_companyDocument",
    }),
    document: one(Document, {
      fields: [CompanyDocument.documentId],
      references: [Document.id],
      relationName: "document_to_companyDocument",
    }),
    createdBy: one(User, {
      fields: [CompanyDocument.createdBy],
      references: [User.id],
    }),
  }),
);
