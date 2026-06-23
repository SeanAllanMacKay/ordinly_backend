import { and, eq, isNull } from "drizzle-orm";
import { db, Company } from "../../index.js";

export type SelectCompanyByIdProps = { companyId: string };

// Lightweight lookup of a non-deleted company's core fields, used where an
// action needs the company name (for emails) or owner (to protect the owner).
export const selectCompanyById = async ({
  companyId,
}: SelectCompanyByIdProps) => {
  return await db.query.Company.findFirst({
    where: and(eq(Company.id, companyId), isNull(Company.deletedDate)),
    columns: { id: true, name: true, owner: true, isPersonal: true },
  });
};
