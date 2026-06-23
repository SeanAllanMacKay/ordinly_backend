import { eq, and } from "drizzle-orm";

import { db, CompanyProject } from "../../index.js";

export type SelectProjectProps = {
  userId: string;
  projectId: string;
  companyId: string;
};

// Scoped to the owning company (via CompanyProject) — authorization is handled
// by the action-layer RBAC guard, so this only enforces that the project
// actually belongs to the company in the path (a mismatch returns undefined).
export const selectProject = async ({
  projectId,
  companyId,
}: SelectProjectProps) => {
  return await db.query.Project.findFirst({
    where: (project, { exists }) =>
      and(
        eq(project.id, projectId),
        exists(
          db
            .select()
            .from(CompanyProject)
            .where(
              and(
                eq(CompanyProject.projectId, project.id),
                eq(CompanyProject.companyId, companyId),
              ),
            ),
        ),
      ),
    with: {
      status: true,
      priority: true,
      locations: true,
      tasks: true,
    },
  });
};
