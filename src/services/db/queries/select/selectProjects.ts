import { eq, count, and } from "drizzle-orm";

import { db, Project, UserProject } from "../../index.js";

export type SelectProjectsProps = {
  userId?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
};

export const selectProjects = async ({
  userId,
  page = 1,
  pageSize = 15,
}: SelectProjectsProps) => {
  const [{ totalItems }] = await db
    .selectDistinct({ totalItems: count() })
    .from(Project)
    .innerJoin(UserProject, eq(Project.id, UserProject.projectId))
    .where(userId ? eq(UserProject.userId, userId) : undefined);

  const projects = await db.query.Project.findMany({
    where: (project, { exists }) =>
      exists(
        db
          .select()
          .from(UserProject)
          .where(
            and(
              eq(UserProject.projectId, project.id),
              userId ? eq(UserProject.userId, userId) : undefined,
            ),
          ),
      ),
    with: {
      status: true,
      priority: true,
    },
    orderBy: (projects, { asc }) => asc(projects.name),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    projects,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
