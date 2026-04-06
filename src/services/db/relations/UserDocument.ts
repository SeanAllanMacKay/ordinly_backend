import { relations } from "drizzle-orm";
import { User, UserDocument, Document } from "../schemas";

export const UserDocumentRelations = relations(UserDocument, ({ one }) => ({
  user: one(User, {
    fields: [UserDocument.userId],
    references: [User.id],
    relationName: "user_to_userDocument",
  }),
  document: one(Document, {
    fields: [UserDocument.documentId],
    references: [Document.id],
    relationName: "document_to_userDocument",
  }),
  createdBy: one(User, {
    fields: [UserDocument.userId],
    references: [User.id],
  }),
}));
