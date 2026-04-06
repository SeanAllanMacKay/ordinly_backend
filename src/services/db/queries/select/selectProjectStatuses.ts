import { db, ProjectStatus } from "../../";

export type SelectProjectStatusesProps = {
  companyId?: (typeof ProjectStatus.$inferInsert)["companyId"];
};

export const selectProjectStatuses = async ({
  companyId,
}: SelectProjectStatusesProps) => {
  return await db.select().from(ProjectStatus);
};
