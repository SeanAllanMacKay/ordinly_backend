import { db, ProjectPriority } from "../../";

export type SelectProjectPrioritiesProps = {
  companyId?: (typeof ProjectPriority.$inferInsert)["companyId"];
};

export const selectProjectPriorities = async ({
  companyId,
}: SelectProjectPrioritiesProps) => {
  return await db.select().from(ProjectPriority);
};
