import { and, eq, isNull } from "drizzle-orm";

import { db, Client, Contact, softDeleteOwnedContactInfo } from "../../index.js";

export type DeleteClientProps = {
  clientId: string;
  companyId: string;
  userId: string;
};

// Soft-deletes a client, cascading to its contacts and all owned
// phone/email/location info (for the client and its contacts). Scoped by
// companyId. Returns the deleted client, or undefined if not in the company.
export const deleteClient = async ({
  clientId,
  companyId,
  userId,
}: DeleteClientProps) => {
  return await db.transaction(async (tx) => {
    const [client] = await tx
      .update(Client)
      .set({ deletedDate: new Date(), deletedBy: userId })
      .where(
        and(
          eq(Client.id, clientId),
          eq(Client.companyId, companyId),
          isNull(Client.deletedDate),
        ),
      )
      .returning();

    if (!client) return undefined;

    const contacts = await tx
      .select({ id: Contact.id })
      .from(Contact)
      .where(
        and(eq(Contact.clientId, clientId), isNull(Contact.deletedDate)),
      );
    const contactIds = contacts.map((contact) => contact.id);

    if (contactIds.length) {
      await tx
        .update(Contact)
        .set({ deletedDate: new Date(), deletedBy: userId })
        .where(
          and(eq(Contact.clientId, clientId), isNull(Contact.deletedDate)),
        );
    }

    await softDeleteOwnedContactInfo(tx, {
      ownerType: "client",
      ownerIds: [clientId],
      userId,
    });
    await softDeleteOwnedContactInfo(tx, {
      ownerType: "contact",
      ownerIds: contactIds,
      userId,
    });

    return client;
  });
};
