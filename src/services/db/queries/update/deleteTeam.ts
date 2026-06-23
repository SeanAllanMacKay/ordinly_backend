import { and, eq, isNull } from "drizzle-orm";
import { db, Team, TeamMember } from "../../index.js";

export type DeleteTeamProps = {
  teamId: string;
  companyId: string;
  userId: string;
};

// Soft-deletes a team and its memberships. Scoped by companyId. Returns the
// deleted team, or undefined if it didn't belong to the company.
export const deleteTeam = async ({
  teamId,
  companyId,
  userId,
}: DeleteTeamProps) => {
  return await db.transaction(async (transaction) => {
    const [team] = await transaction
      .update(Team)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(
        and(
          eq(Team.id, teamId),
          eq(Team.companyId, companyId),
          isNull(Team.deletedDate),
        ),
      )
      .returning();

    if (team) {
      await transaction
        .update(TeamMember)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(
          and(
            eq(TeamMember.teamId, teamId),
            isNull(TeamMember.deletedDate),
          ),
        );
    }

    return team;
  });
};
