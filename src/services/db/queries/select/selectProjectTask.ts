import { and, eq } from "drizzle-orm";
import { db, Task } from "../../index.js";
import { buildProjectTaskPermissionFilter } from "../util/buildProjectTaskPermissionFilter.js";

export type SelectProjectTaskProps = {
  userId: string;
  projectId: string;
  taskId: string;
};

export const selectProjectTask = async ({
  userId,
  projectId,
  taskId,
}: SelectProjectTaskProps) => {
  const permissions = buildProjectTaskPermissionFilter({ userId, projectId });

  const task = await db.query.Task.findFirst({
    where: and(permissions, eq(Task.id, taskId)),
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
