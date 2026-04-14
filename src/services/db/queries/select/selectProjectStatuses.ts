import { db, ProjectStatus } from "../../index.js";

export type SelectProjectStatusesProps = {
  companyId?: (typeof ProjectStatus.$inferInsert)["companyId"];
};

export const selectProjectStatuses = async ({
  companyId,
}: SelectProjectStatusesProps) => {
  return await db.select().from(ProjectStatus);
};
