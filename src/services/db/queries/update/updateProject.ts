import { eq } from "drizzle-orm";
import { db, Project } from "../../";

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
  ...insertProps
}: UpdateProjectProps) => {
  const [project] = await db
    .update(Project)
    .set(insertProps)
    .where(eq(Project.id, projectId))
    .returning();

  return project;
};
