import { eq } from "drizzle-orm";
import { db, Project, ProjectLocation } from "../../index.js";

export type UpdateProjectProps = {
  userId: string;
  projectId: string;
} & Partial<
  Omit<
    typeof Project.$inferInsert,
    "id" | "verificationCode" | "createdDate" | "createdBy"
  >
> & { location: Omit<typeof ProjectLocation.$inferInsert, "id"> };

export const updateProject = async ({
  userId,
  projectId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
  location,
}: UpdateProjectProps) => {
  return await db.transaction(async (transaction) => {
    const [project] = await transaction
      .update(Project)
      .set({
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        updatedDate: new Date(),
      })
      .where(eq(Project.id, projectId))
      .returning();

    if (location) {
      await transaction
        .insert(ProjectLocation)
        .values({ ...location, projectId })
        .onConflictDoUpdate({
          target: ProjectLocation.projectId,
          set: location,
        });
    }

    return project;
  });
};
