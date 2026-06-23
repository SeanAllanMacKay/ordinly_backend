import { and, eq, exists } from "drizzle-orm";
import { db, Document, TaskDocument, Task } from "../../index.js";
import { buildProjectTaskPermissionFilter } from "../util/buildProjectTaskPermissionFilter.js";

export type SelectProjectTaskDocumentProps = {
  userId: string;
  projectId: string;
  taskId: string;
  documentId: string;
};

export const selectProjectTaskDocument = async ({
  userId,
  projectId,
  taskId,
  documentId,
}: SelectProjectTaskDocumentProps) => {
  const permissions = buildProjectTaskPermissionFilter({ userId, projectId });

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
              permissions,
            ),
          ),
      ),
    ),
  });

  return result;
};
