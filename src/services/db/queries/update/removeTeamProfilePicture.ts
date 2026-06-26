import { and, eq } from "drizzle-orm";

import { db, Document, Team } from "../../index.js";

export type RemoveTeamProfilePictureProps = {
  teamId: string;
  companyId: string;
  userId: string;
};

// Clears a team's profile picture: nulls the FK and soft-deletes the Document.
// Returns the removed base path (if any) for best-effort bucket cleanup.
export const removeTeamProfilePicture = async ({
  teamId,
  companyId,
  userId,
}: RemoveTeamProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const current = await transaction.query.Team.findFirst({
      where: and(eq(Team.id, teamId), eq(Team.companyId, companyId)),
      columns: {},
      with: { profilePicture: { columns: { id: true, externalPath: true } } },
    });

    if (!current?.profilePicture) {
      return { oldBasePath: null };
    }

    await transaction
      .update(Team)
      .set({ profilePicture: null })
      .where(and(eq(Team.id, teamId), eq(Team.companyId, companyId)));

    await transaction
      .update(Document)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(eq(Document.id, current.profilePicture.id));

    return { oldBasePath: current.profilePicture.externalPath };
  });
};
