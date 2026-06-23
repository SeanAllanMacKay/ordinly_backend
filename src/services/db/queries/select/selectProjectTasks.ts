import { and, eq, exists, isNull } from "drizzle-orm";
import { db, Task, TaskChecklistItem, CompanyProject, UserTask } from "../../index.js";

export type SelectProjectTasksProps = {
  userId: string;
  companyId: string;
  projectId: string;
  /** When true, restrict to tasks the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export const selectProjectTasks = async ({
  userId,
  companyId,
  projectId,
  assignedOnly = false,
  page = 1,
  pageSize = 15,
}: SelectProjectTasksProps) => {
  // Task is in this project, the project belongs to the company, and (when
  // restricted) the task is assigned to the user. Authorization is handled by
  // the action-layer RBAC guard; this only scopes for integrity + read tier.
  const buildConditions = (taskId: typeof Task.id) =>
    and(
      isNull(Task.deletedDate),
      eq(Task.projectId, projectId),
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
                and(eq(UserTask.taskId, taskId), eq(UserTask.userId, userId)),
              ),
          )
        : undefined,
    );

  const totalItems = await db.$count(Task, buildConditions(Task.id));

  const tasks = await db.query.Task.findMany({
    where: (task) => buildConditions(task.id),
    with: {
      status: true,
      priority: true,
      checklist: {
        where: isNull(TaskChecklistItem.deletedDate),
      },
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
