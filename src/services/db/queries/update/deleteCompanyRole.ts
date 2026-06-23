import { and, eq, isNull } from "drizzle-orm";
import { db, CompanyRole, UserCompanyRole } from "../../index.js";

export type DeleteCompanyRoleProps = {
  roleId: string;
  companyId: string;
  userId: string;
};

// Soft-deletes a company-specific role and any worker assignments of it. Scoped
// by companyId so system roles (companyId IS NULL) can't be deleted. Returns
// the deleted role, or undefined if nothing matched.
export const deleteCompanyRole = async ({
  roleId,
  companyId,
  userId,
}: DeleteCompanyRoleProps) => {
  return await db.transaction(async (transaction) => {
    const [role] = await transaction
      .update(CompanyRole)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(
        and(
          eq(CompanyRole.id, roleId),
          eq(CompanyRole.companyId, companyId),
          isNull(CompanyRole.deletedDate),
        ),
      )
      .returning();

    if (role) {
      await transaction
        .update(UserCompanyRole)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(
          and(
            eq(UserCompanyRole.roleId, roleId),
            isNull(UserCompanyRole.deletedDate),
          ),
        );
    }

    return role;
  });
};
