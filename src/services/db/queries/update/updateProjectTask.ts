import { and, eq, exists } from "drizzle-orm";
import { db, Project, Task, CompanyProject } from "../../index.js";

export type UpdateProjectTaskProps = {
  userId: string;
  taskId: string;
  projectId: string;
  companyId: string;
} & Partial<Omit<typeof Task.$inferInsert, "id" | "createdDate" | "createdBy">>;

export const updateProjectTask = async ({
  userId,
  projectId,
  companyId,
  taskId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: UpdateProjectTaskProps) => {
  return await db.transaction(async (transaction) => {
    // Scoped by project + owning company so a mismatched task matches no row.
    const [task] = await transaction
      .update(Task)
      .set({
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdDate: new Date(),
      })
      .where(
        and(
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
      )
      .returning();

    await transaction
      .update(Project)
      .set({
        updatedDate: new Date(),
      })
      .where(eq(Project.id, projectId));

    return task;
  });
};
