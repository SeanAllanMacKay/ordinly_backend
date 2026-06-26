import { and, eq } from "drizzle-orm";

import { db, Document, Contact } from "../../index.js";

export type RemoveContactProfilePictureProps = {
  contactId: string;
  clientId: string;
  companyId: string;
  userId: string;
};

// Clears a contact's profile picture: nulls the FK and soft-deletes the
// Document. Returns the removed base path (if any) for best-effort bucket cleanup.
export const removeContactProfilePicture = async ({
  contactId,
  clientId,
  companyId,
  userId,
}: RemoveContactProfilePictureProps) => {
  return db.transaction(async (transaction) => {
    const current = await transaction.query.Contact.findFirst({
      where: and(
        eq(Contact.id, contactId),
        eq(Contact.clientId, clientId),
        eq(Contact.companyId, companyId),
      ),
      columns: {},
      with: { profilePicture: { columns: { id: true, externalPath: true } } },
    });

    if (!current?.profilePicture) {
      return { oldBasePath: null };
    }

    await transaction
      .update(Contact)
      .set({ profilePicture: null })
      .where(
        and(
          eq(Contact.id, contactId),
          eq(Contact.clientId, clientId),
          eq(Contact.companyId, companyId),
        ),
      );

    await transaction
      .update(Document)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(eq(Document.id, current.profilePicture.id));

    return { oldBasePath: current.profilePicture.externalPath };
  });
};
