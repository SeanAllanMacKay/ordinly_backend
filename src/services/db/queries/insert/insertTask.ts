import { Task, db } from "../../";

export type InsertTaskProps = {
  userId: string;
  projectId: string;
  checklist: string[];
} & Omit<
  typeof Task.$inferInsert,
  "id" | "createdDate" | "createdBy" | "deletedDate" | "deletedBy"
>;

export const insertTask = async ({ userId, ...restTask }: InsertTaskProps) => {
  return await db.transaction(async (transaction) => {
    const [task] = await transaction
      .insert(Task)
      .values({
        ...restTask,
        createdBy: userId,
      })
      .returning();

    return task;
  });
};
