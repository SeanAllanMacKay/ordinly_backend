import { and, eq } from "drizzle-orm";
import { db, Task } from "../../";
import { buildProjectTaskPermissionFilter } from "../util/buildProjectTaskPermissionFilter";

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

  return await db.query.Task.findFirst({
    where: and(permissions, eq(Task.id, taskId)),
    with: {
      status: true,
      priority: true,
      checklist: true,
    },
  });
};
