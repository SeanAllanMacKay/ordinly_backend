import { and, asc, eq, isNull } from "drizzle-orm";

import { db, Contact } from "../../index.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectContactOptionsProps = {
  companyId: string;
  clientId: string;
  search?: string;
};

// Slimmed-down { value, label } list of a client's (non-deleted) contacts for FE selects.
export const selectContactOptions = async ({
  companyId,
  clientId,
  search,
}: SelectContactOptionsProps) => {
  return await db
    .select({ value: Contact.id, label: Contact.name })
    .from(Contact)
    .where(
      and(
        eq(Contact.companyId, companyId),
        eq(Contact.clientId, clientId),
        isNull(Contact.deletedDate),
        optionSearch(Contact.name, search),
      ),
    )
    .orderBy(asc(Contact.name))
    .limit(OPTIONS_LIMIT);
};
