import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Contact,
  replaceOwnedContactInfo,
  OwnedContactInfoInput,
  reconcileProjectsForContact,
  AccessibleIds,
} from "../../index.js";

export type UpdateContactProps = {
  contactId: string;
  clientId: string;
  companyId: string;
  userId: string;
  name?: string;
  role?: string;
  description?: string;
  projectIds?: string[];
  projectAccess?: AccessibleIds;
} & OwnedContactInfoInput;

// Updates a contact's fields and reconciles its phone/email/location info (same
// provided-replaces / omitted-keeps rule as updateClient). Scoped by client and
// company. Returns the updated contact, or undefined if not found.
export const updateContact = async ({
  contactId,
  clientId,
  companyId,
  userId,
  name,
  role,
  description,
  phoneNumbers,
  emails,
  locations,
  projectIds,
  projectAccess,
}: UpdateContactProps) => {
  return await db.transaction(async (tx) => {
    const [contact] = await tx
      .update(Contact)
      .set({
        name,
        role,
        description,
        updatedDate: new Date(),
        updatedBy: userId,
      })
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

    await replaceOwnedContactInfo(tx, {
      ownerType: "contact",
      ownerId: contact.id,
      userId,
      phoneNumbers,
      emails,
      locations,
    });

    if (projectIds !== undefined && projectAccess) {
      await reconcileProjectsForContact(tx, {
        contactId: contact.id,
        clientId,
        companyId,
        userId,
        projectIds,
        projectAccess,
      });
    }

    return contact;
  });
};
