import { and, asc, eq, isNull } from "drizzle-orm";

import { db, Team } from "../../index.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectTeamOptionsProps = {
  companyId: string;
  search?: string;
};

// Slimmed-down { value, label } list of a company's (non-deleted) teams for FE selects.
export const selectTeamOptions = async ({
  companyId,
  search,
}: SelectTeamOptionsProps) => {
  return await db
    .select({ value: Team.id, label: Team.name })
    .from(Team)
    .where(
      and(
        eq(Team.companyId, companyId),
        isNull(Team.deletedDate),
        optionSearch(Team.name, search),
      ),
    )
    .orderBy(asc(Team.name))
    .limit(OPTIONS_LIMIT);
};
