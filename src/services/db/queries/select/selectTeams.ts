import { and, eq, isNull } from "drizzle-orm";
import { db, Team, TeamMember } from "../../index.js";

export type SelectTeamsProps = { companyId: string };

// Lists a company's (non-deleted) teams with their current members.
export const selectTeams = async ({ companyId }: SelectTeamsProps) => {
  return await db.query.Team.findMany({
    where: and(eq(Team.companyId, companyId), isNull(Team.deletedDate)),
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
    orderBy: (team, { asc }) => asc(team.createdDate),
  });
};
