import { and, eq } from "drizzle-orm";

import { db, Document, Client } from "../../index.js";

export type RemoveClientProfilePictureProps = {
  clientId: string;
  companyId: string;
  userId: string;
};

// Clears a client's profile picture: nulls the FK and soft-deletes the Document.
// Returns the removed base path (if any) for best-effort bucket cleanup.
export const removeClientProfilePicture = async ({
  clientId,
  companyId,
  userId,
}: RemoveClientProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const current = await transaction.query.Client.findFirst({
      where: and(eq(Client.id, clientId), eq(Client.companyId, companyId)),
      columns: {},
      with: { profilePicture: { columns: { id: true, externalPath: true } } },
    });

    if (!current?.profilePicture) {
      return { oldBasePath: null };
    }

    await transaction
      .update(Client)
      .set({ profilePicture: null })
      .where(and(eq(Client.id, clientId), eq(Client.companyId, companyId)));

    await transaction
      .update(Document)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(eq(Document.id, current.profilePicture.id));

    return { oldBasePath: current.profilePicture.externalPath };
  });
};
