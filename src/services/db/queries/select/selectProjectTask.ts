import { and, eq } from "drizzle-orm";
import { db, CompanyProject } from "../../index.js";

export type SelectProjectTaskProps = {
  userId: string;
  companyId: string;
  projectId: string;
  taskId: string;
};

// Scoped to the project + owning company for integrity; authorization is handled
// by the action-layer RBAC guard.
export const selectProjectTask = async ({
  companyId,
  projectId,
  taskId,
}: SelectProjectTaskProps) => {
  const task = await db.query.Task.findFirst({
    where: (task, { exists }) =>
      and(
        eq(task.id, taskId),
        eq(task.projectId, projectId),
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
    with: {
      status: true,
      priority: true,
      checklist: true,
      documents: {
        with: {
          document: true,
        },
      },
    },
  });

  if (!task) {
    return undefined;
  }

  return { ...task, documents: task.documents.map(({ document }) => document) };
};
