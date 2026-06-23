import { and, eq, exists } from "drizzle-orm";
import { db, Document, TaskDocument, Task, CompanyProject } from "../../index.js";

export type SelectProjectTaskDocumentProps = {
  userId: string;
  companyId: string;
  projectId: string;
  taskId: string;
  documentId: string;
};

// Scoped to the task → project → owning company for integrity; authorization is
// handled by the action-layer RBAC guard.
export const selectProjectTaskDocument = async ({
  companyId,
  projectId,
  taskId,
  documentId,
}: SelectProjectTaskDocumentProps) => {
  const result = await db.query.Document.findFirst({
    where: and(
      eq(Document.id, documentId),
      exists(
        db
          .select()
          .from(TaskDocument)
          .innerJoin(Task, eq(TaskDocument.taskId, Task.id))
          .where(
            and(
              eq(TaskDocument.documentId, Document.id),
              eq(Task.id, taskId),
              eq(Task.projectId, projectId),
              exists(
                db
                  .select()
                  .from(CompanyProject)
                  .where(
                    and(
                      eq(CompanyProject.projectId, projectId),
                      eq(CompanyProject.companyId, companyId),
                    ),
                  ),
              ),
            ),
          ),
      ),
    ),
  });

  return result;
};
