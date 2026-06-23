import { and, eq } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";

export type InsertCompanyMemberProps = {
  companyId: string;
  userId: string;
  roleIds: string[];
  assignedBy: string;
};

// Adds a user to a company with the given role(s). Used when inviting an
// existing user and when converting a pending invitation on signup. Idempotent:
// reactivates a previously-removed membership and any soft-deleted role rows.
export const insertCompanyMember = async ({
  companyId,
  userId,
  roleIds,
  assignedBy,
}: InsertCompanyMemberProps) => {
  return await db.transaction(async (transaction) => {
    // Create the membership, or reactivate it if the user was removed before.
    await transaction
      .insert(UserCompany)
      .values({ userId, companyId, assignedBy })
      .onConflictDoUpdate({
        target: [UserCompany.userId, UserCompany.companyId],
        set: { deletedDate: null, deletedBy: null, assignedBy },
      });

    const [membership] = await transaction
      .select()
      .from(UserCompany)
      .where(
        and(
          eq(UserCompany.userId, userId),
          eq(UserCompany.companyId, companyId),
        ),
      );

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
