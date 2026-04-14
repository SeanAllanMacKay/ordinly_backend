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
  const [task] = await db
    .update(Task)
    .set({
      name,
      description,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
    .where(eq(Task.id, taskId))
    .returning();

  return task;
};
