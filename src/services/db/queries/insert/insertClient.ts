import {
  db,
  Client,
  Contact,
  insertOwnedContactInfo,
  OwnedContactInfoInput,
} from "../../index.js";

type NestedContactInput = {
  name: string;
  role?: string;
  description?: string;
} & OwnedContactInfoInput;

export type InsertClientProps = {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
  clientCompanyId?: string;
  clientUserId?: string;
  contacts?: NestedContactInput[];
} & OwnedContactInfoInput;

// Creates a client with its (polymorphic) phone/email/location info and any
// nested contacts, each with their own contact info. Single transaction.
export const insertClient = async ({
  companyId,
  userId,
  name,
  description,
  clientCompanyId,
  clientUserId,
  phoneNumbers,
  emails,
  locations,
  contacts = [],
}: InsertClientProps) => {
  return await db.transaction(async (tx) => {
    const [client] = await tx
      .insert(Client)
      .values({
        companyId,
        name,
        description,
        clientCompanyId,
        clientUserId,
        createdBy: userId,
      })
      .returning();

    await insertOwnedContactInfo(tx, {
      ownerType: "client",
      ownerId: client.id,
      userId,
      phoneNumbers,
      emails,
      locations,
    });

    for (const contact of contacts) {
      const [created] = await tx
        .insert(Contact)
        .values({
          companyId,
          clientId: client.id,
          name: contact.name,
          role: contact.role,
          description: contact.description,
          createdBy: userId,
        })
        .returning();

      await insertOwnedContactInfo(tx, {
        ownerType: "contact",
        ownerId: created.id,
        userId,
        phoneNumbers: contact.phoneNumbers,
        emails: contact.emails,
        locations: contact.locations,
      });
    }

    return client;
  });
};
