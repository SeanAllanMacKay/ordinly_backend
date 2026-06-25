import {
  db,
  Team,
  TeamMember,
  reconcileProjectsForTeam,
  reconcileClientsForTeam,
  AccessibleIds,
} from "../../index.js";

export type InsertTeamProps = {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
  memberIds?: string[];
  projectIds?: string[];
  clientIds?: string[];
  projectAccess?: AccessibleIds;
  clientAccess?: AccessibleIds;
};

// Creates a team and its initial membership. The action validates that every
// memberId is a member of the company before calling this.
export const insertTeam = async ({
  companyId,
  userId,
  name,
  description,
  memberIds = [],
  projectIds,
  clientIds,
  projectAccess,
  clientAccess,
}: InsertTeamProps) => {
  return await db.transaction(async (transaction) => {
    const [team] = await transaction
      .insert(Team)
      .values({ companyId, name, description, createdBy: userId })
      .returning();

    if (memberIds.length) {
      await transaction.insert(TeamMember).values(
        memberIds.map((memberId) => ({
          teamId: team.id,
          userId: memberId,
          assignedBy: userId,
        })),
      );
    }

    if (projectIds !== undefined && projectAccess) {
      await reconcileProjectsForTeam(transaction, {
        teamId: team.id,
        companyId,
        userId,
        projectIds,
        projectAccess,
      });
    }
    if (clientIds !== undefined && clientAccess) {
      await reconcileClientsForTeam(transaction, {
        teamId: team.id,
        companyId,
        userId,
        clientIds,
        clientAccess,
      });
    }

    return team;
  });
};
