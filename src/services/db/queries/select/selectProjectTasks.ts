import { and, eq } from "drizzle-orm";
import { db, Task } from "../../index.js";
import { buildProjectTaskPermissionFilter } from "../util/buildProjectTaskPermissionFilter.js";

export type SelectProjectTasksProps = {
  userId: string;
  projectId: string;
  page?: number;
  pageSize?: number;
};

export const selectProjectTasks = async ({
  userId,
  projectId,
  page = 1,
  pageSize = 15,
}: SelectProjectTasksProps) => {
  const totalItems = await db.$count(
    Task,
    buildProjectTaskPermissionFilter({ userId, projectId }),
  );

  const tasks = await db.query.Task.findMany({
    where: and(
      buildProjectTaskPermissionFilter({ userId, projectId }),
      eq(Task.projectId, projectId),
    ),
    with: {
      status: true,
      priority: true,
      checklist: true,
    },
    orderBy: (tasks, { desc }) => desc(tasks.updatedDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    tasks,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
