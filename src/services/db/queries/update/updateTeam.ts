import { and, eq, isNull, notInArray } from "drizzle-orm";
import {
  db,
  Team,
  TeamMember,
  reconcileProjectsForTeam,
  reconcileClientsForTeam,
  AccessibleIds,
} from "../../index.js";

export type UpdateTeamProps = {
  teamId: string;
  companyId: string;
  userId: string;
  name?: string;
  description?: string;
  // When provided, the team's membership is reconciled to exactly this set.
  memberIds?: string[];
  projectIds?: string[];
  clientIds?: string[];
  projectAccess?: AccessibleIds;
  clientAccess?: AccessibleIds;
};

// Updates a team's name/description and, when memberIds is provided, reconciles
// its membership to that exact set. Scoped by companyId. Returns the updated
// team, or undefined if it doesn't belong to the company.
export const updateTeam = async ({
  teamId,
  companyId,
  userId,
  name,
  description,
  memberIds,
  projectIds,
  clientIds,
  projectAccess,
  clientAccess,
}: UpdateTeamProps) => {
  return await db.transaction(async (transaction) => {
    const [team] = await transaction
      .update(Team)
      .set({ name, description })
      .where(
        and(
          eq(Team.id, teamId),
          eq(Team.companyId, companyId),
          isNull(Team.deletedDate),
        ),
      )
      .returning();

    if (!team) return undefined;

    if (memberIds) {
      // Soft-delete members no longer in the set.
      await transaction
        .update(TeamMember)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(
          and(
            eq(TeamMember.teamId, teamId),
            isNull(TeamMember.deletedDate),
            memberIds.length
              ? notInArray(TeamMember.userId, memberIds)
              : undefined,
          ),
        );

      // (Re)activate the desired members.
      for (const memberId of memberIds) {
        await transaction
          .insert(TeamMember)
          .values({ teamId, userId: memberId, assignedBy: userId })
          .onConflictDoUpdate({
            target: [TeamMember.teamId, TeamMember.userId],
            set: {
              deletedDate: null,
              deletedBy: null,
              assignedBy: userId,
              assignedDate: new Date(),
            },
          });
      }
    }

    if (projectIds !== undefined && projectAccess) {
      await reconcileProjectsForTeam(transaction, {
        teamId,
        companyId,
        userId,
        projectIds,
        projectAccess,
      });
    }
    if (clientIds !== undefined && clientAccess) {
      await reconcileClientsForTeam(transaction, {
        teamId,
        companyId,
        userId,
        clientIds,
        clientAccess,
      });
    }

    return team;
  });
};
