import { eq, and } from "drizzle-orm";

import { db, UserProject } from "../../";

export type SelectProjectProps = {
  userId: string;
  projectId: string;
};

export const selectProject = async ({
  userId,
  projectId,
}: SelectProjectProps) => {
  return await db.query.Project.findFirst({
    where: (project, { exists }) =>
      and(
        eq(project.id, projectId),
        exists(
          db
            .select()
            .from(UserProject)
            .where(
              and(
                eq(UserProject.projectId, project.id),
                eq(UserProject.userId, userId),
              ),
            ),
        ),
      ),
    with: {
      status: true,
      priority: true,
    },
  });
};
