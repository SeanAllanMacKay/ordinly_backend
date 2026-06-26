import { eq } from "drizzle-orm";

import { db, Document, User } from "../../index.js";
import type { UploadedImageVariants } from "../../../files/types.js";

export type SetUserProfilePictureProps = {
  userId: string;
  upload: UploadedImageVariants;
};

// Points a user at a freshly uploaded profile-picture Document and soft-deletes
// the one it replaces. Returns the previous base path (if any) so the caller can
// best-effort remove the old variants from the bucket. All-or-nothing in a tx.
export const setUserProfilePicture = async ({
  userId,
  upload,
}: SetUserProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const previous = await transaction.query.User.findFirst({
      where: eq(User.id, userId),
      columns: {},
      with: { profilePicture: { columns: { id: true, externalPath: true } } },
    });

    const [document] = await transaction
      .insert(Document)
      .values({
        name: upload.fileName,
        externalId: upload.fileId,
        externalPath: upload.path,
        isPublic: upload.isPublic,
        createdBy: userId,
      })
      .returning();

    await transaction
      .update(User)
      .set({ profilePicture: document.id })
      .where(eq(User.id, userId));

    if (previous?.profilePicture) {
      await transaction
        .update(Document)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(eq(Document.id, previous.profilePicture.id));
    }

    return { oldBasePath: previous?.profilePicture?.externalPath ?? null };
  });
};
