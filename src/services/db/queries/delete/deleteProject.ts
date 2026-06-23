import { and, eq, exists, isNull } from "drizzle-orm";
import { db, Project, Task, TaskChecklistItem, CompanyProject } from "../../index.js";

export type DeleteProjectProps = {
  userId: string;
  projectId: string;
  companyId: string;
};

/**
 * Soft-delete a project and cascade to its tasks (every phase/milestone/task is
 * stamped via projectId) and their checklist items. Scoped by companyId so a
 * project that doesn't belong to the company in the path matches no row
 * (returns undefined → 404 in the action).
 */
export const deleteProject = async ({
  userId,
  projectId,
  companyId,
}: DeleteProjectProps) => {
  return await db.transaction(async (transaction) => {
    const now = new Date();

    const [project] = await transaction
      .update(Project)
      .set({ deletedDate: now, deletedBy: userId })
      .where(
        and(
          eq(Project.id, projectId),
          isNull(Project.deletedDate),
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

    if (!project) return undefined;

    // Checklist items first (their guard references the tasks before those are
    // marked deleted — the projectId predicate is unaffected by the stamp).
    await transaction
      .update(TaskChecklistItem)
      .set({ deletedDate: now, deletedBy: userId })
      .where(
        and(
          isNull(TaskChecklistItem.deletedDate),
          exists(
            db
              .select()
              .from(Task)
              .where(
                and(
                  eq(Task.id, TaskChecklistItem.taskId),
                  eq(Task.projectId, projectId),
                ),
              ),
          ),
        ),
      );

    await transaction
      .update(Task)
      .set({ deletedDate: now, deletedBy: userId })
      .where(and(eq(Task.projectId, projectId), isNull(Task.deletedDate)));

    return project;
  });
};
