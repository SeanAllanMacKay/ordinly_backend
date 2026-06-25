import { and, eq, isNull } from "drizzle-orm";

import { db, Company } from "../../index.js";

export type SelectActiveOwnedCompaniesProps = {
  userId: string;
};

/**
 * Active, non-personal companies the user owns. Account deletion is blocked
 * while any exist — the user must delete or transfer them first so a teammate's
 * shared data isn't wiped along with the account.
 */
export const selectActiveOwnedCompanies = async ({
  userId,
}: SelectActiveOwnedCompaniesProps) => {
  return db.query.Company.findMany({
    where: and(
      eq(Company.owner, userId),
      eq(Company.isPersonal, false),
      isNull(Company.deletedDate),
    ),
    columns: { id: true, name: true },
  });
};
