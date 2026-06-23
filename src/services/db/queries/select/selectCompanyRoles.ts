import { and, eq, isNull, or } from "drizzle-orm";
import { db, CompanyRole } from "../../index.js";

export type SelectCompanyRolesProps = { companyId: string };

// Lists the roles available to a company: its own custom roles plus the global
// system roles (companyId IS NULL) that every company can assign.
export const selectCompanyRoles = async ({
  companyId,
}: SelectCompanyRolesProps) => {
  return await db.query.CompanyRole.findMany({
    where: and(
      isNull(CompanyRole.deletedDate),
      or(eq(CompanyRole.companyId, companyId), isNull(CompanyRole.companyId)),
    ),
    orderBy: (role, { asc }) => asc(role.createdDate),
  });
};
