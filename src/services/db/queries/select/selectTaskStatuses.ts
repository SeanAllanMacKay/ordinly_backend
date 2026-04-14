import { db, TaskStatus } from "../../index.js";

export type SelectTaskStatusesProps = {
  companyId?: (typeof TaskStatus.$inferInsert)["companyId"];
};

export const selectTaskStatuses = async ({
  companyId,
}: SelectTaskStatusesProps) => {
  return await db.select().from(TaskStatus);
};
