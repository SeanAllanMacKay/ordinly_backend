import { and, asc, eq, exists, isNull } from "drizzle-orm";

import { db, Project, CompanyProject, UserProject } from "../../index.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectProjectOptionsProps = {
  userId: string;
  companyId: string;
  /** When true, restrict to projects the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  search?: string;
};

// Slimmed-down { value, label } list of a company's (non-deleted) projects for FE
// selects. Scoped to the company via CompanyProject; when assignedOnly is set, only
// projects the user is assigned to are returned.
export const selectProjectOptions = async ({
  userId,
  companyId,
  assignedOnly = false,
  search,
}: SelectProjectOptionsProps) => {
  return await db
    .select({ value: Project.id, label: Project.name })
    .from(Project)
    .where(
      and(
        isNull(Project.deletedDate),
        optionSearch(Project.name, search),
        exists(
          db
            .select()
            .from(CompanyProject)
            .where(
              and(
                eq(CompanyProject.projectId, Project.id),
                eq(CompanyProject.companyId, companyId),
              ),
            ),
        ),
        assignedOnly
          ? exists(
              db
                .select()
                .from(UserProject)
                .where(
                  and(
                    eq(UserProject.projectId, Project.id),
                    eq(UserProject.userId, userId),
                  ),
                ),
            )
          : undefined,
      ),
    )
    .orderBy(asc(Project.name))
    .limit(OPTIONS_LIMIT);
};
