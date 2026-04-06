import { Project, UserProject, CompanyProject, db } from "../../";

export type InsertProjectProps = { userId: string; companyId?: string } & Omit<
  typeof Project.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
>;

export const insertProject = async ({
  userId,
  companyId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: InsertProjectProps) => {
  return await db.transaction(async (transaction) => {
    const [project] = await transaction
      .insert(Project)
      .values({
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdBy: userId,
      })
      .returning();

    await transaction.insert(UserProject).values({
      userId,
      projectId: project.id,
      companyId,
      assignedBy: userId,
    });

    if (companyId) {
      await transaction.insert(CompanyProject).values({
        companyId,
        projectId: project.id,
        isOwner: true,
        assignedBy: userId,
      });
    }

    return project;
  });
};
