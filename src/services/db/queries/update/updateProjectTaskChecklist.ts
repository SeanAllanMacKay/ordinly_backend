import { and, eq, getTableColumns, notInArray, sql } from "drizzle-orm";
import { db, Task, TaskChecklistItem } from "../../index.js";

export type UpdateProjectTaskChecklistProps = {
  userId: string;
  taskId: string;
  projectId: string;
  items: Omit<
    typeof TaskChecklistItem.$inferInsert,
    "createdDate" | "createdBy"
  >[];
};

export const updateProjectTaskChecklist = async ({
  userId,
  projectId,
  taskId,
  items,
}: UpdateProjectTaskChecklistProps) => {
  return await db.transaction(async (transaction) => {
    if (items.length) {
      await transaction.delete(TaskChecklistItem).where(
        and(
          eq(TaskChecklistItem.taskId, taskId),
          notInArray(
            TaskChecklistItem.id,
            items.reduce(
              (total, { id }) => (id ? [...total, id] : total),
              [] as string[],
            ),
          ),
        ),
      );

      await transaction
        .insert(TaskChecklistItem)
        .values(items.map((item) => ({ ...item, createdBy: userId, taskId })))
        .onConflictDoUpdate({
          target: TaskChecklistItem.id,
          set: {
            name: sql`EXCLUDED."name"`,
            isComplete: sql`EXCLUDED."isComplete"`,
            order: sql`EXCLUDED."order"`,
          },
        });
    } else {
      await transaction
        .delete(TaskChecklistItem)
        .where(eq(TaskChecklistItem.taskId, taskId));
    }
  });
};
