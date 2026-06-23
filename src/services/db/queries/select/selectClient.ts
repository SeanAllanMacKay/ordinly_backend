import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Client,
  Contact,
  selectOwnedContactInfo,
  selectOwnedContactInfoBatch,
} from "../../index.js";

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
      contacts: {
        where: isNull(Contact.deletedDate),
        orderBy: (contact, { asc }) => asc(contact.createdDate),
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

  const contacts = client.contacts.map((contact) => ({
    ...contact,
    ...contactInfo[contact.id],
  }));

  return { exists: true, client: { ...client, ...ownInfo, contacts } };
};
