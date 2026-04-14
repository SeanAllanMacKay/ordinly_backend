import { db, TaskPriority } from "../../index.js";

export type SelectTaskPrioritiesProps = {
  companyId?: (typeof TaskPriority.$inferInsert)["companyId"];
};

export const selectTaskPriorities = async ({
  companyId,
}: SelectTaskPrioritiesProps) => {
  return await db.select().from(TaskPriority);
};
