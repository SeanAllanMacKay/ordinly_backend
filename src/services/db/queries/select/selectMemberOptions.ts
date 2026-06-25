import { and, asc, eq, isNull } from "drizzle-orm";

import { db, UserCompany, User } from "../../index.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectMemberOptionsProps = {
  companyId: string;
  search?: string;
};

// Slimmed-down { value, label } list of a company's (non-deleted) members for FE
// selects. value is the User id (members are assigned to teams/tasks/approvers by
// user), label is the user's name.
export const selectMemberOptions = async ({
  companyId,
  search,
}: SelectMemberOptionsProps) => {
  return await db
    .select({ value: User.id, label: User.name })
    .from(UserCompany)
    .innerJoin(User, eq(User.id, UserCompany.userId))
    .where(
      and(
        eq(UserCompany.companyId, companyId),
        isNull(UserCompany.deletedDate),
        optionSearch(User.name, search),
      ),
    )
    .orderBy(asc(User.name))
    .limit(OPTIONS_LIMIT);
};
