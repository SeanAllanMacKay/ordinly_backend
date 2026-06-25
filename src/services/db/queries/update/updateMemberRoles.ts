import { and, eq, isNull, notInArray } from "drizzle-orm";
import {
  db,
  UserCompany,
  UserCompanyRole,
  reconcileProjectsForUser,
  reconcileClientsForUser,
  reconcileTeamsForUser,
  AccessibleIds,
} from "../../index.js";

export type UpdateMemberRolesProps = {
  companyId: string;
  userId: string; // the member being updated
  assignedBy: string;
  roleIds?: string[];
  projectIds?: string[];
  clientIds?: string[];
  teamIds?: string[];
  projectAccess?: AccessibleIds;
  clientAccess?: AccessibleIds;
};

// Replaces a member's role assignments with the given set (when provided) and
// reconciles their project/client/team links. Returns the membership, or
// undefined if the user isn't a member of the company.
export const updateMemberRoles = async ({
  companyId,
  userId,
  assignedBy,
  roleIds,
  projectIds,
  clientIds,
  teamIds,
  projectAccess,
  clientAccess,
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

    if (roleIds !== undefined) {
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
    }

    // Reconcile the member's project/client/team links (user side).
    if (projectIds !== undefined && projectAccess) {
      await reconcileProjectsForUser(transaction, {
        memberId: userId,
        companyId,
        userId: assignedBy,
        projectIds,
        projectAccess,
      });
    }
    if (clientIds !== undefined && clientAccess) {
      await reconcileClientsForUser(transaction, {
        memberId: userId,
        companyId,
        userId: assignedBy,
        clientIds,
        clientAccess,
      });
    }
    await reconcileTeamsForUser(transaction, {
      memberId: userId,
      companyId,
      userId: assignedBy,
      teamIds,
    });

    return membership;
  });
};
