import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Client,
  Contact,
  selectOwnedContactInfo,
  selectOwnedContactInfoBatch,
} from "../../index.js";
import { fileService } from "../../../files/index.js";

export type SelectClientProps = { clientId: string; companyId: string };

// Fetches a single client scoped to its company, fully hydrated: its own
// phone/email/location info plus its contacts, each with their own info.
// Returns { exists, client } for clean 404 handling.
export const selectClient = async ({
  clientId,
  companyId,
}: SelectClientProps) => {
  const client = await db.query.Client.findFirst({
    where: and(
      eq(Client.id, clientId),
      eq(Client.companyId, companyId),
      isNull(Client.deletedDate),
    ),
    with: {
      profilePicture: { columns: { externalPath: true } },
      contacts: {
        where: isNull(Contact.deletedDate),
        orderBy: (contact, { asc }) => asc(contact.createdDate),
        with: { profilePicture: { columns: { externalPath: true } } },
      },
    },
  });

  if (!client) return { exists: false, client: undefined };

  const ownInfo = await selectOwnedContactInfo({
    ownerType: "client",
    ownerId: client.id,
  });

  const contactInfo = await selectOwnedContactInfoBatch({
    ownerType: "contact",
    ownerIds: client.contacts.map((contact) => contact.id),
  });

  const contacts = await Promise.all(
    client.contacts.map(async ({ profilePicture, ...contact }) => ({
      ...contact,
      ...contactInfo[contact.id],
      profilePicture: await fileService.buildContactProfilePictureURLs(
        profilePicture?.externalPath,
      ),
    })),
  );

  const { profilePicture, ...clientRest } = client;

  return {
    exists: true,
    client: {
      ...clientRest,
      ...ownInfo,
      profilePicture: await fileService.buildClientProfilePictureURLs(
        profilePicture?.externalPath,
      ),
      contacts,
    },
  };
};
