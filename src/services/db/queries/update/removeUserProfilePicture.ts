import { eq } from "drizzle-orm";

import { db, Document, User } from "../../index.js";

export type RemoveUserProfilePictureProps = {
  userId: string;
};

// Clears a user's profile picture: nulls the FK and soft-deletes the Document.
// Returns the removed base path (if any) for best-effort bucket cleanup.
export const removeUserProfilePicture = async ({
  userId,
}: RemoveUserProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const current = await transaction.query.User.findFirst({
      where: eq(User.id, userId),
      columns: {},
      with: { profilePicture: { columns: { id: true, externalPath: true } } },
    });

    if (!current?.profilePicture) {
      return { oldBasePath: null };
    }

    await transaction
      .update(User)
      .set({ profilePicture: null })
      .where(eq(User.id, userId));

    await transaction
      .update(Document)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(eq(Document.id, current.profilePicture.id));

    return { oldBasePath: current.profilePicture.externalPath };
  });
};
