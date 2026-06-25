import { and, asc, eq, exists, isNull } from "drizzle-orm";

import { db, Client, UserClient } from "../../index.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectClientOptionsProps = {
  userId: string;
  companyId: string;
  /** When true, restrict to clients the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  search?: string;
};

// Slimmed-down { value, label } list of a company's (non-deleted) clients for FE
// selects. When assignedOnly is set, only clients the user is assigned to are returned.
export const selectClientOptions = async ({
  userId,
  companyId,
  assignedOnly = false,
  search,
}: SelectClientOptionsProps) => {
  return await db
    .select({ value: Client.id, label: Client.name })
    .from(Client)
    .where(
      and(
        eq(Client.companyId, companyId),
        isNull(Client.deletedDate),
        optionSearch(Client.name, search),
        assignedOnly
          ? exists(
              db
                .select()
                .from(UserClient)
                .where(
                  and(
                    eq(UserClient.clientId, Client.id),
                    eq(UserClient.userId, userId),
                  ),
                ),
            )
          : undefined,
      ),
    )
    .orderBy(asc(Client.name))
    .limit(OPTIONS_LIMIT);
};
