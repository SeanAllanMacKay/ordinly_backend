import { relations } from "drizzle-orm";
import { ProjectDocument, Document, User, Project } from "../schemas/index.js";

export const ProjectDocumentRelations = relations(
  ProjectDocument,
  ({ one }) => ({
    project: one(Project, {
      fields: [ProjectDocument.projectId],
      references: [Project.id],
      relationName: "project_to_projectDocument",
    }),
    document: one(Document, {
      fields: [ProjectDocument.documentId],
      references: [Document.id],
      relationName: "document_to_projectDocument",
    }),
    createdBy: one(User, {
      fields: [ProjectDocument.createdBy],
      references: [User.id],
    }),
  }),
);
