import { and, eq, isNull } from "drizzle-orm";
import { db, Team, TeamMember } from "../../index.js";
import { fileService } from "../../../files/index.js";

export type SelectTeamsProps = { companyId: string };

// Lists a company's (non-deleted) teams with their current members. Each team's
// profilePicture is resolved to a public variant URL map (null when unset).
export const selectTeams = async ({ companyId }: SelectTeamsProps) => {
  const teams = await db.query.Team.findMany({
    where: and(eq(Team.companyId, companyId), isNull(Team.deletedDate)),
    with: {
      profilePicture: { columns: { externalPath: true } },
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

  return Promise.all(
    teams.map(async ({ profilePicture, ...rest }) => ({
      ...rest,
      profilePicture: await fileService.buildTeamProfilePictureURLs(
        profilePicture?.externalPath,
      ),
    })),
  );
};
