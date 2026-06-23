import { eq, and, exists } from "drizzle-orm";
import { db, Project, ProjectLocation, CompanyProject } from "../../index.js";

export type UpdateProjectProps = {
  userId: string;
  projectId: string;
  companyId: string;
} & Partial<
  Omit<
    typeof Project.$inferInsert,
    "id" | "verificationCode" | "createdDate" | "createdBy"
  >
> & { location: Omit<typeof ProjectLocation.$inferInsert, "id"> };

export const updateProject = async ({
  userId,
  projectId,
  companyId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
  location,
}: UpdateProjectProps) => {
  return await db.transaction(async (transaction) => {
    // Scoped by companyId so a project that doesn't belong to the company in the
    // path matches no row (returns undefined → 404 in the action).
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
      .where(
        and(
          eq(Project.id, projectId),
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
