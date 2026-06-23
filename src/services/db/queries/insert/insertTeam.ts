import { db, Team, TeamMember } from "../../index.js";

export type InsertTeamProps = {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
  memberIds?: string[];
};

// Creates a team and its initial membership. The action validates that every
// memberId is a member of the company before calling this.
export const insertTeam = async ({
  companyId,
  userId,
  name,
  description,
  memberIds = [],
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

    return team;
  });
};
