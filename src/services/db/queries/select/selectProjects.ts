import { eq, count, and, exists } from "drizzle-orm";

import { db, Project, CompanyProject, UserProject } from "../../index.js";

export type SelectProjectsProps = {
  userId: string;
  companyId: string;
  /** When true, restrict to projects the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export const selectProjects = async ({
  userId,
  companyId,
  assignedOnly = false,
  page = 1,
  pageSize = 15,
}: SelectProjectsProps) => {
  // Project belongs to the company, and (when restricted) is assigned to the user.
  const buildConditions = (projectId: typeof Project.id) =>
    and(
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
      assignedOnly
        ? exists(
            db
              .select()
              .from(UserProject)
              .where(
                and(
                  eq(UserProject.projectId, projectId),
                  eq(UserProject.userId, userId),
                ),
              ),
          )
        : undefined,
    );

  const [{ totalItems }] = await db
    .select({ totalItems: count() })
    .from(Project)
    .where(buildConditions(Project.id));

  const projects = await db.query.Project.findMany({
    where: (project) => buildConditions(project.id),
    with: {
      status: true,
      priority: true,
      locations: true,
    },
    orderBy: (projects, { desc }) => desc(projects.updatedDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    projects,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
