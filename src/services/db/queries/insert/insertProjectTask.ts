import { Task, TaskChecklistItem, db } from "../../";

export type InsertTaskProps = {
  userId: string;
  projectId: string;
  checklist: string[];
} & Omit<
  typeof Task.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
>;

export const insertProjectTask = async ({
  userId,
  checklist,
  ...restTask
}: InsertTaskProps) => {
  return await db.transaction(async (transaction) => {
    const [task] = await transaction
      .insert(Task)
      .values({
        ...restTask,
        createdBy: userId,
      })
      .returning();

    const checklistResponse = await transaction
      .insert(TaskChecklistItem)
      .values(
        checklist.map((value, index) => ({
          taskId: task.id,
          name: value,
          order: index,
          isComplete: false,
          createdBy: userId,
        })),
      );

    return { ...task, checklist: checklistResponse };
  });
};
