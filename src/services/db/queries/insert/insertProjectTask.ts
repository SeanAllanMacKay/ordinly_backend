import { eq } from "drizzle-orm";
import {
  Project,
  Task,
  TaskChecklistItem,
  db,
  Document,
  TaskDocument,
  reconcileUsersForTask,
  reconcileTeamsForTask,
  reconcileChildTasksForPhase,
  reconcileTaskSequences,
  reconcileTaskRelationships,
  SequenceInput,
  RelationshipInput,
} from "../../index.js";
import { fileService } from "../../../files/index.js";
import { taskType } from "../../constants.js";

export type InsertProjectTaskProps = {
  userId: string;
  companyId?: string;
  projectId: string;
  checklist: string[];
  taskId?: string;
  documents?: Awaited<ReturnType<typeof fileService.uploadTaskDocuments>>;
  type?: (typeof taskType)[number];
  userIds?: string[];
  teamIds?: string[];
  childTaskIds?: string[];
  sequences?: SequenceInput[];
  relationships?: RelationshipInput[];
} & Omit<
  typeof Task.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
>;

export const insertProjectTask = async ({
  userId,
  companyId,
  checklist,
  projectId,
  taskId,
  documents,
  userIds,
  teamIds,
  childTaskIds,
  sequences,
  relationships,
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

    // Connection links (assignees, teams, dependencies, phase children).
    if (companyId) {
      await reconcileUsersForTask(transaction, {
        taskId: task.id,
        companyId,
        userId,
        userIds,
      });
      await reconcileTeamsForTask(transaction, {
        taskId: task.id,
        companyId,
        userId,
        teamIds,
      });
    }
    await reconcileTaskSequences(transaction, { taskId: task.id, sequences });
    await reconcileTaskRelationships(transaction, {
      taskId: task.id,
      relationships,
    });
    // Phases own child tasks; tasks/milestones are children, not parents.
    if (restTask.type === "phase") {
      await reconcileChildTasksForPhase(transaction, {
        phaseId: task.id,
        projectId,
        taskIds: childTaskIds,
      });
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
