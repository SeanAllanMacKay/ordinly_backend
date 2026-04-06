import { db, TaskPriority } from "../../";

export type SelectTaskPrioritiesProps = {
  companyId?: (typeof TaskPriority.$inferInsert)["companyId"];
};

export const selectTaskPriorities = async ({
  companyId,
}: SelectTaskPrioritiesProps) => {
  return await db.select().from(TaskPriority);
};
