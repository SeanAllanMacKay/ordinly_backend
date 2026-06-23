import { eq } from "drizzle-orm";
import {
  Project,
  Task,
  TaskChecklistItem,
  db,
  Document,
  TaskDocument,
} from "../../index.js";
import { fileService } from "../../../files/index.js";
import { taskType } from "../../constants.js";

export type InsertProjectTaskProps = {
  userId: string;
  projectId: string;
  checklist: string[];
  taskId?: string;
  documents?: Awaited<ReturnType<typeof fileService.uploadTaskDocuments>>;
  type?: (typeof taskType)[number];
} & Omit<
  typeof Task.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
>;

export const insertProjectTask = async ({
  userId,
  checklist,
  projectId,
  taskId,
  documents,
  ...restTask
}: InsertProjectTaskProps) => {
  return await db.transaction(async (transaction) => {
    let documentRecords: (typeof Document.$inferSelect)[] = [];

    if (documents?.length) {
      documentRecords = await transaction
        .insert(Document)
        .values(
          documents.map((document) => ({
            name: document.fileName,
            externalId: document.fileId,
            externalPath: document.path,
            createdBy: userId,
            isPublic: document.isPublic,
          })),
        )
        .returning();
    }

    const [task] = await transaction
      .insert(Task)
      .values({
        id: taskId,
        ...restTask,
        projectId,
        createdBy: userId,
      })
      .returning();

    let checklistResponse = undefined;

    if (checklist?.length) {
      checklistResponse = await transaction.insert(TaskChecklistItem).values(
        checklist.map((value, index) => ({
          taskId: task.id,
          name: value,
          order: index,
          isComplete: false,
          createdBy: userId,
        })),
      );
    }

    if (documentRecords?.length) {
      await transaction.insert(TaskDocument).values(
        documentRecords.map((document) => ({
          taskId: task.id,
          documentId: document.id,
          createdBy: userId,
        })),
      );
    }

    await transaction
      .update(Project)
      .set({
        updatedDate: new Date(),
      })
      .where(eq(Project.id, projectId));

    return { ...task, checklist: checklistResponse };
  });
};
