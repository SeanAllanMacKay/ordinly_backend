import { and, eq, isNull } from "drizzle-orm";
import { db, CompanyRole } from "../../index.js";

export type UpdateCompanyRoleProps = {
  roleId: string;
  companyId: string;
  name?: string;
  description?: string;
};

// Updates a company role's name/description. Scoped by companyId so system
// roles (companyId IS NULL) can never be edited here. Drizzle omits undefined
// keys, so only provided fields are written.
export const updateCompanyRole = async ({
  roleId,
  companyId,
  name,
  description,
}: UpdateCompanyRoleProps) => {
  const [role] = await db
    .update(CompanyRole)
    .set({ name, description })
    .where(
      and(
        eq(CompanyRole.id, roleId),
        eq(CompanyRole.companyId, companyId),
        isNull(CompanyRole.deletedDate),
      ),
    )
    .returning();

  return role;
};
