import { and, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { db, Project, Task, TaskChecklistItem, CompanyProject } from "../../index.js";

export type DeleteProjectTaskProps = {
  userId: string;
  taskId: string;
  projectId: string;
  companyId: string;
};

/**
 * Soft-delete a task and cascade to all of its descendant tasks (a phase
 * contains child tasks/milestones via parentTaskId) and their checklist items.
 * Scoped by project + owning company so a mismatched task matches no row
 * (returns undefined → 404 in the action).
 */
export const deleteProjectTask = async ({
  userId,
  taskId,
  projectId,
  companyId,
}: DeleteProjectTaskProps) => {
  return await db.transaction(async (transaction) => {
    const now = new Date();

    const [task] = await transaction
      .update(Task)
      .set({ deletedDate: now, deletedBy: userId })
      .where(
        and(
          eq(Task.id, taskId),
          eq(Task.projectId, projectId),
          isNull(Task.deletedDate),
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

    // Walk the parentTaskId hierarchy to collect every descendant of the task.
    const descendants = await transaction.execute(sql`
      WITH RECURSIVE descendants AS (
        SELECT id FROM "Task" WHERE "parentTaskId" = ${taskId}
        UNION ALL
        SELECT t.id FROM "Task" t
        JOIN descendants d ON t."parentTaskId" = d.id
      )
      SELECT id FROM descendants
    `);

    const descendantIds = descendants.rows.map((row: any) => row.id as string);
    const taskIds = [taskId, ...descendantIds];

    if (descendantIds.length) {
      await transaction
        .update(Task)
        .set({ deletedDate: now, deletedBy: userId })
        .where(and(inArray(Task.id, descendantIds), isNull(Task.deletedDate)));
    }

    await transaction
      .update(TaskChecklistItem)
      .set({ deletedDate: now, deletedBy: userId })
      .where(
        and(
          inArray(TaskChecklistItem.taskId, taskIds),
          isNull(TaskChecklistItem.deletedDate),
        ),
      );

    await transaction
      .update(Project)
      .set({ updatedDate: now })
      .where(eq(Project.id, projectId));

    return task;
  });
};
