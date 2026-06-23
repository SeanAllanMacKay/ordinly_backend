import { and, eq, isNull } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";

export type RemoveCompanyMemberProps = {
  companyId: string;
  userId: string; // the member being removed
  removedBy: string;
};

// Removes a member from a company: soft-deletes their membership and all of
// their role assignments (which revokes their RBAC permissions). Returns the
// removed membership, or undefined if the user wasn't a member.
export const removeCompanyMember = async ({
  companyId,
  userId,
  removedBy,
}: RemoveCompanyMemberProps) => {
  return await db.transaction(async (transaction) => {
    const [membership] = await transaction
      .update(UserCompany)
      .set({ deletedDate: new Date(), deletedBy: removedBy })
      .where(
        and(
          eq(UserCompany.userId, userId),
          eq(UserCompany.companyId, companyId),
          isNull(UserCompany.deletedDate),
        ),
      )
      .returning();

    if (membership) {
      await transaction
        .update(UserCompanyRole)
        .set({ deletedDate: new Date(), deletedBy: removedBy })
        .where(
          and(
            eq(UserCompanyRole.userCompanyId, membership.id),
            isNull(UserCompanyRole.deletedDate),
          ),
        );
    }

    return membership;
  });
};
