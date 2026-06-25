import { and, eq, exists } from "drizzle-orm";
import {
  db,
  Project,
  Task,
  CompanyProject,
  reconcileUsersForTask,
  reconcileTeamsForTask,
  reconcileChildTasksForPhase,
  reconcileTaskSequences,
  reconcileTaskRelationships,
  SequenceInput,
  RelationshipInput,
} from "../../index.js";
import { taskType } from "../../constants.js";

export type UpdateProjectTaskProps = {
  userId: string;
  taskId: string;
  projectId: string;
  companyId: string;
  // Restricts which row is updated by Task.type (e.g. the tasks endpoint only
  // touches type='task'; phases/milestones pass their own type).
  typeFilter?: (typeof taskType)[number];
  userIds?: string[];
  teamIds?: string[];
  childTaskIds?: string[];
  sequences?: SequenceInput[];
  relationships?: RelationshipInput[];
} & Partial<
  Omit<typeof Task.$inferInsert, "id" | "createdDate" | "createdBy" | "type">
>;

export const updateProjectTask = async ({
  userId,
  projectId,
  companyId,
  taskId,
  typeFilter,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
  parentTaskId,
  approver,
  isPaymentTrigger,
  userIds,
  teamIds,
  childTaskIds,
  sequences,
  relationships,
}: UpdateProjectTaskProps) => {
  return await db.transaction(async (transaction) => {
    // Scoped by project + owning company (and optionally type) so a mismatched
    // task matches no row.
    const [task] = await transaction
      .update(Task)
      .set({
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        parentTaskId,
        approver,
        isPaymentTrigger,
        updatedDate: new Date(),
      })
      .where(
        and(
          eq(Task.id, taskId),
          eq(Task.projectId, projectId),
          typeFilter ? eq(Task.type, typeFilter) : undefined,
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
      )
      .returning();

    if (!task) return undefined;

    // Connection links (assignees, teams, dependencies, phase children).
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
    await reconcileTaskSequences(transaction, { taskId: task.id, sequences });
    await reconcileTaskRelationships(transaction, {
      taskId: task.id,
      relationships,
    });
    if (task.type === "phase") {
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

    return task;
  });
};
