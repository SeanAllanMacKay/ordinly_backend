import { db, ProjectPriority } from "../../index.js";

export type SelectProjectPrioritiesProps = {
  companyId?: (typeof ProjectPriority.$inferInsert)["companyId"];
};

export const selectProjectPriorities = async ({
  companyId,
}: SelectProjectPrioritiesProps) => {
  return await db.select().from(ProjectPriority);
};
