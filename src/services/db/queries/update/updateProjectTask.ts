import { eq } from "drizzle-orm";
import { db, Project, Task } from "../../index.js";

export type UpdateProjectTaskProps = {
  userId: string;
  taskId: string;
  projectId: string;
} & Partial<Omit<typeof Task.$inferInsert, "id" | "createdDate" | "createdBy">>;

export const updateProjectTask = async ({
  userId,
  projectId,
  taskId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: UpdateProjectTaskProps) => {
  return await db.transaction(async (transaction) => {
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
      .where(eq(Task.id, taskId))
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
