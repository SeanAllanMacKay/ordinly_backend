import { eq } from "drizzle-orm";
import { db, CompanyRole, ProjectRole } from "../../index.js";

export type SelectRoleCompanyProps = {
  roleId: string;
  scope: "company" | "project";
};

/**
 * Resolves the company a role belongs to (for RBAC scoping). A null companyId
 * means a global/system role (seeded template) that isn't owned by any company.
 */
export const selectRoleCompany = async ({
  roleId,
  scope,
}: SelectRoleCompanyProps): Promise<{
  exists: boolean;
  companyId: string | null;
}> => {
  if (scope === "project") {
    const role = await db.query.ProjectRole.findFirst({
      where: eq(ProjectRole.id, roleId),
      columns: { companyId: true },
    });

    return { exists: !!role, companyId: role?.companyId ?? null };
  }

  const role = await db.query.CompanyRole.findFirst({
    where: eq(CompanyRole.id, roleId),
    columns: { companyId: true },
  });

  return { exists: !!role, companyId: role?.companyId ?? null };
};
