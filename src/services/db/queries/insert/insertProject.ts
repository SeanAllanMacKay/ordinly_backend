import { and, eq } from "drizzle-orm";
import {
  Project,
  UserProject,
  CompanyProject,
  db,
  Company,
  ProjectLocation,
  reconcileProjectConnectionsForProject,
  AccessibleIds,
} from "../../index.js";

export type InsertProjectProps = { userId: string; companyId?: string } & Omit<
  typeof Project.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
> & {
    location: Omit<typeof ProjectLocation.$inferInsert, "id" | "projectId">;
    clientIds?: string[];
    contactIds?: string[];
    clientAccess?: AccessibleIds;
  };

export const insertProject = async ({
  userId,
  companyId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
  location,
  clientIds,
  contactIds,
  clientAccess,
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

    if (!companyId) {
      const personalCompany = await transaction.query.Company.findFirst({
        where: () =>
          and(eq(Company.isPersonal, true), eq(Company.owner, userId)),
      });

      if (!personalCompany?.id) {
        transaction.rollback();
        throw new Error("Personal company not found");
      }

      companyId = personalCompany?.id;
    }

    await transaction.insert(CompanyProject).values({
      companyId,
      projectId: project.id,
      isOwner: true,
      assignedBy: userId,
    });

    if (location) {
      await transaction
        .insert(ProjectLocation)
        .values({ projectId: project.id, ...location });
    }

    if (
      companyId &&
      (clientIds !== undefined || contactIds !== undefined) &&
      clientAccess
    ) {
      await reconcileProjectConnectionsForProject(transaction, {
        projectId: project.id,
        companyId,
        userId,
        clientIds,
        contactIds,
        clientAccess,
      });
    }

    return project;
  });
};
