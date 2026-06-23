import { and, count, eq, isNull } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";

export type SelectCompanyMembersProps = {
  companyId: string;
  page?: number;
  pageSize?: number;
};

// Lists a company's members (non-deleted UserCompany rows) with each member's
// user details and their currently-assigned roles. Paginated like selectCompanies.
export const selectCompanyMembers = async ({
  companyId,
  page = 1,
  pageSize = 15,
}: SelectCompanyMembersProps) => {
  const [{ totalItems }] = await db
    .select({ totalItems: count() })
    .from(UserCompany)
    .where(
      and(
        eq(UserCompany.companyId, companyId),
        isNull(UserCompany.deletedDate),
      ),
    );

  const members = await db.query.UserCompany.findMany({
    where: and(
      eq(UserCompany.companyId, companyId),
      isNull(UserCompany.deletedDate),
    ),
    columns: { id: true, userId: true, companyId: true, assignedDate: true },
    with: {
      user: {
        columns: { id: true, name: true, email: true, isVerified: true },
      },
      roles: {
        where: isNull(UserCompanyRole.deletedDate),
        with: { role: true },
      },
    },
    orderBy: (userCompany, { asc }) => asc(userCompany.assignedDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    members,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
