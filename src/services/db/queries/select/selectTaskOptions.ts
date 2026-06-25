import { and, asc, eq, exists, isNull } from "drizzle-orm";

import { db, Task, CompanyProject, UserTask } from "../../index.js";
import { taskType } from "../../constants.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectTaskOptionsProps = {
  userId: string;
  companyId: string;
  projectId: string;
  /** Task row type — distinguishes tasks, phases and milestones in the Task table. */
  type: (typeof taskType)[number];
  /** When true, restrict to tasks the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  search?: string;
};

// Slimmed-down { value, label } list of a project's (non-deleted) Task rows of a
// given type (task | phase | milestone) for FE selects. The project is verified to
// belong to the company; when assignedOnly is set, only the user's assigned rows return.
export const selectTaskOptions = async ({
  userId,
  companyId,
  projectId,
  type,
  assignedOnly = false,
  search,
}: SelectTaskOptionsProps) => {
  return await db
    .select({ value: Task.id, label: Task.name })
    .from(Task)
    .where(
      and(
        isNull(Task.deletedDate),
        eq(Task.projectId, projectId),
        eq(Task.type, type),
        optionSearch(Task.name, search),
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
                .from(UserTask)
                .where(
                  and(
                    eq(UserTask.taskId, Task.id),
                    eq(UserTask.userId, userId),
                  ),
                ),
            )
          : undefined,
      ),
    )
    .orderBy(asc(Task.name))
    .limit(OPTIONS_LIMIT);
};
