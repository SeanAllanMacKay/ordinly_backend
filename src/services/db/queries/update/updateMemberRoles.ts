import { and, eq, isNull, notInArray } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";

export type UpdateMemberRolesProps = {
  companyId: string;
  userId: string; // the member being updated
  roleIds: string[];
  assignedBy: string;
};

// Replaces a member's role assignments with the given set: soft-deletes roles
// no longer present and (re)activates the desired ones. Returns the membership,
// or undefined if the user isn't a member of the company.
export const updateMemberRoles = async ({
  companyId,
  userId,
  roleIds,
  assignedBy,
}: UpdateMemberRolesProps) => {
  return await db.transaction(async (transaction) => {
    const [membership] = await transaction
      .select()
      .from(UserCompany)
      .where(
        and(
          eq(UserCompany.userId, userId),
          eq(UserCompany.companyId, companyId),
          isNull(UserCompany.deletedDate),
        ),
      );

    if (!membership) return undefined;

    // Soft-delete any currently-active roles not in the new set.
    await transaction
      .update(UserCompanyRole)
      .set({ deletedDate: new Date(), deletedBy: assignedBy })
      .where(
        and(
          eq(UserCompanyRole.userCompanyId, membership.id),
          isNull(UserCompanyRole.deletedDate),
          roleIds.length
            ? notInArray(UserCompanyRole.roleId, roleIds)
            : undefined,
        ),
      );

    // (Re)activate the desired roles.
    for (const roleId of roleIds) {
      await transaction
        .insert(UserCompanyRole)
        .values({ userCompanyId: membership.id, roleId, assignedBy })
        .onConflictDoUpdate({
          target: [UserCompanyRole.userCompanyId, UserCompanyRole.roleId],
          set: {
            deletedDate: null,
            deletedBy: null,
            assignedBy,
            assignedDate: new Date(),
          },
        });
    }

    return membership;
  });
};
