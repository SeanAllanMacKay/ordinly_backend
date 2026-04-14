import { eq } from "drizzle-orm";
import { db, Project } from "../../index.js";

export type UpdateProjectProps = {
  userId: string;
  projectId: string;
} & Partial<
  Omit<
    typeof Project.$inferInsert,
    "id" | "verificationCode" | "createdDate" | "createdBy"
  >
>;

export const updateProject = async ({
  userId,
  projectId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: UpdateProjectProps) => {
  const [project] = await db
    .update(Project)
    .set({
      name,
      description,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
    .where(eq(Project.id, projectId))
    .returning();

  return project;
};
