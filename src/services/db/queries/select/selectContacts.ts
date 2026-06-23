import { and, eq, isNull } from "drizzle-orm";

import { db, Contact, selectOwnedContactInfoBatch } from "../../index.js";

export type SelectContactsProps = { clientId: string; companyId: string };

// Lists a client's (non-deleted) contacts, each with its phone/email/location.
export const selectContacts = async ({
  clientId,
  companyId,
}: SelectContactsProps) => {
  const contacts = await db.query.Contact.findMany({
    where: and(
      eq(Contact.clientId, clientId),
      eq(Contact.companyId, companyId),
      isNull(Contact.deletedDate),
    ),
    orderBy: (contact, { asc }) => asc(contact.createdDate),
  });

  const infoMap = await selectOwnedContactInfoBatch({
    ownerType: "contact",
    ownerIds: contacts.map((contact) => contact.id),
  });

  return contacts.map((contact) => ({ ...contact, ...infoMap[contact.id] }));
};
