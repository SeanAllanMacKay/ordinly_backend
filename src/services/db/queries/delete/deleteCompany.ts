import { and, eq, exists, inArray, isNull } from "drizzle-orm";
import { db, Company, Project, Task, TaskChecklistItem, CompanyProject } from "../../index.js";

export type DeleteCompanyProps = {
  userId: string;
  companyId: string;
};

/**
 * Soft-delete a company and cascade to every project linked via CompanyProject
 * and that project's full task → checklist-item tree. Returns undefined if the
 * company doesn't exist or is already deleted (→ 404 in the action). Owner-only
 * authorization and the personal-company block are enforced in the action.
 */
export const deleteCompany = async ({
  userId,
  companyId,
}: DeleteCompanyProps) => {
  return await db.transaction(async (transaction) => {
    const now = new Date();

    const [company] = await transaction
      .update(Company)
      .set({ deletedDate: now, deletedBy: userId })
      .where(and(eq(Company.id, companyId), isNull(Company.deletedDate)))
      .returning();

    if (!company) return undefined;

    const projectRows = await transaction
      .select({ projectId: CompanyProject.projectId })
      .from(CompanyProject)
      .where(eq(CompanyProject.companyId, companyId));

    const projectIds = projectRows
      .map((row) => row.projectId)
      .filter((id): id is string => Boolean(id));

    if (projectIds.length) {
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
                    inArray(Task.projectId, projectIds),
                  ),
                ),
            ),
          ),
        );

      await transaction
        .update(Task)
        .set({ deletedDate: now, deletedBy: userId })
        .where(
          and(inArray(Task.projectId, projectIds), isNull(Task.deletedDate)),
        );

      await transaction
        .update(Project)
        .set({ deletedDate: now, deletedBy: userId })
        .where(and(inArray(Project.id, projectIds), isNull(Project.deletedDate)));
    }

    return company;
  });
};
