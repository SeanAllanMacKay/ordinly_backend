import { exists, or, and, eq } from "drizzle-orm";
import { CompanyProject, db, UserCompany, UserProject } from "../../index.js";

export const buildProjectTaskPermissionFilter = ({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) => {
  return or(
    // 1. User is assigned to the project via UserProject
    exists(
      db
        .select()
        .from(UserProject)
        .where(
          and(
            eq(UserProject.projectId, projectId),
            eq(UserProject.userId, userId),
          ),
        ),
    ),
    // 2. User's company is assigned to the project via CompanyProject
    exists(
      db
        .select()
        .from(UserCompany)
        .innerJoin(
          CompanyProject,
          eq(UserCompany.companyId, CompanyProject.projectId),
        )
        .where(
          and(
            eq(CompanyProject.projectId, projectId),
            eq(UserCompany.userId, userId),
          ),
        ),
    ),
  );
};
