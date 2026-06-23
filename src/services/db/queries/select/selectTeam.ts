import { and, eq, isNull } from "drizzle-orm";
import { db, Team, TeamMember } from "../../index.js";

export type SelectTeamProps = { teamId: string; companyId: string };

// Fetches a single team scoped to its company, with its current members.
// Returns { exists, team } for clean 404 handling.
export const selectTeam = async ({ teamId, companyId }: SelectTeamProps) => {
  const team = await db.query.Team.findFirst({
    where: and(
      eq(Team.id, teamId),
      eq(Team.companyId, companyId),
      isNull(Team.deletedDate),
    ),
    with: {
      members: {
        where: isNull(TeamMember.deletedDate),
        with: {
          user: {
            columns: { id: true, name: true, email: true, isVerified: true },
          },
        },
      },
    },
  });

  return { exists: !!team, team };
};
