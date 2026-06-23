import { and, eq, isNull } from "drizzle-orm";

import { db, Contact, softDeleteOwnedContactInfo } from "../../index.js";

export type DeleteContactProps = {
  contactId: string;
  clientId: string;
  companyId: string;
  userId: string;
};

// Soft-deletes a contact and its owned phone/email/location info. Scoped by
// client and company. Returns the deleted contact, or undefined if not found.
export const deleteContact = async ({
  contactId,
  clientId,
  companyId,
  userId,
}: DeleteContactProps) => {
  return await db.transaction(async (tx) => {
    const [contact] = await tx
      .update(Contact)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(
        and(
          eq(Contact.id, contactId),
          eq(Contact.clientId, clientId),
          eq(Contact.companyId, companyId),
          isNull(Contact.deletedDate),
        ),
      )
      .returning();

    if (!contact) return undefined;

    await softDeleteOwnedContactInfo(tx, {
      ownerType: "contact",
      ownerIds: [contactId],
      userId,
    });

    return contact;
  });
};
