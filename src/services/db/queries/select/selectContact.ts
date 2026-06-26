import { and, eq, isNull } from "drizzle-orm";

import { db, Contact, selectOwnedContactInfo } from "../../index.js";
import { fileService } from "../../../files/index.js";

export type SelectContactProps = {
  contactId: string;
  clientId: string;
  companyId: string;
};

// Fetches a single contact scoped to its client and company, with its
// phone/email/location info. Returns { exists, contact }.
export const selectContact = async ({
  contactId,
  clientId,
  companyId,
}: SelectContactProps) => {
  const contact = await db.query.Contact.findFirst({
    where: and(
      eq(Contact.id, contactId),
      eq(Contact.clientId, clientId),
      eq(Contact.companyId, companyId),
      isNull(Contact.deletedDate),
    ),
    with: { profilePicture: { columns: { externalPath: true } } },
  });

  if (!contact) return { exists: false, contact: undefined };

  const info = await selectOwnedContactInfo({
    ownerType: "contact",
    ownerId: contact.id,
  });

  const { profilePicture, ...contactRest } = contact;

  return {
    exists: true,
    contact: {
      ...contactRest,
      ...info,
      profilePicture: await fileService.buildContactProfilePictureURLs(
        profilePicture?.externalPath,
      ),
    },
  };
};
