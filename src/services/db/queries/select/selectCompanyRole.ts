import { and, eq, isNull, or } from "drizzle-orm";
import { db, CompanyRole } from "../../index.js";

export type SelectCompanyRoleProps = { roleId: string; companyId: string };

// Fetches a single role visible to the company — either its own role or a
// global system role. Returns { exists, role } so the action can 404 cleanly.
export const selectCompanyRole = async ({
  roleId,
  companyId,
}: SelectCompanyRoleProps) => {
  const role = await db.query.CompanyRole.findFirst({
    where: and(
      eq(CompanyRole.id, roleId),
      isNull(CompanyRole.deletedDate),
      or(eq(CompanyRole.companyId, companyId), isNull(CompanyRole.companyId)),
    ),
  });

  return { exists: !!role, role };
};
