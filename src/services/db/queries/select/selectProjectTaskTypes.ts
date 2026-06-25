import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, Task } from "../../index.js";
import { taskType } from "../../constants.js";

export type SelectProjectTaskTypesProps = {
  projectId: string;
  taskIds: string[];
};

/**
 * Returns a Map of taskId → type for the given ids that exist as non-deleted
 * tasks in the project. Missing ids are simply absent from the map — callers use
 * that to reject links that point outside the project.
 */
export const selectProjectTaskTypes = async ({
  projectId,
  taskIds,
}: SelectProjectTaskTypesProps): Promise<
  Map<string, (typeof taskType)[number]>
> => {
  if (!taskIds.length) return new Map();

  const rows = await db
    .select({ id: Task.id, type: Task.type })
    .from(Task)
    .where(
      and(
        eq(Task.projectId, projectId),
        inArray(Task.id, taskIds),
        isNull(Task.deletedDate),
      ),
    );

  return new Map(rows.map((r) => [r.id, r.type]));
};
