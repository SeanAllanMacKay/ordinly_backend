import { relations } from "drizzle-orm";
import { TaskDocument, Document, User, Task } from "../schemas/index.js";

export const TaskDocumentRelations = relations(TaskDocument, ({ one }) => ({
  task: one(Task, {
    fields: [TaskDocument.taskId],
    references: [Task.id],
    relationName: "task_to_taskDocument",
  }),
  document: one(Document, {
    fields: [TaskDocument.documentId],
    references: [Document.id],
    relationName: "document_to_taskDocument",
  }),
  createdBy: one(User, {
    fields: [TaskDocument.createdBy],
    references: [User.id],
  }),
}));
