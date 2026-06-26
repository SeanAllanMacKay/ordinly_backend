import { and, eq } from "drizzle-orm";

import { db, Document, Contact } from "../../index.js";
import type { UploadedImageVariants } from "../../../files/types.js";

export type SetContactProfilePictureProps = {
  contactId: string;
  clientId: string;
  companyId: string;
  userId: string;
  upload: UploadedImageVariants;
};

// Points a contact at a freshly uploaded profile-picture Document and
// soft-deletes the one it replaces. Returns the previous base path (if any) for
// best-effort bucket cleanup. All-or-nothing in a tx.
export const setContactProfilePicture = async ({
  contactId,
  clientId,
  companyId,
  userId,
  upload,
}: SetContactProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const previous = await transaction.query.Contact.findFirst({
      where: and(
        eq(Contact.id, contactId),
        eq(Contact.clientId, clientId),
        eq(Contact.companyId, companyId),
      ),
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
      .update(Contact)
      .set({ profilePicture: document.id })
      .where(
        and(
          eq(Contact.id, contactId),
          eq(Contact.clientId, clientId),
          eq(Contact.companyId, companyId),
        ),
      );

    if (previous?.profilePicture) {
      await transaction
        .update(Document)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(eq(Document.id, previous.profilePicture.id));
    }

    return { oldBasePath: previous?.profilePicture?.externalPath ?? null };
  });
};
