import {
  db,
  Client,
  Contact,
  insertOwnedContactInfo,
  OwnedContactInfoInput,
  reconcileProjectsForClient,
  reconcileUsersForClient,
  reconcileTeamsForClient,
  AccessibleIds,
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
  projectIds?: string[];
  userIds?: string[];
  teamIds?: string[];
  projectAccess?: AccessibleIds;
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
  projectIds,
  userIds,
  teamIds,
  projectAccess,
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

    if (projectIds !== undefined && projectAccess) {
      await reconcileProjectsForClient(tx, {
        clientId: client.id,
        companyId,
        userId,
        projectIds,
        projectAccess,
      });
    }

    await reconcileUsersForClient(tx, {
      clientId: client.id,
      companyId,
      userId,
      userIds,
    });
    await reconcileTeamsForClient(tx, {
      clientId: client.id,
      companyId,
      userId,
      teamIds,
    });

    return client;
  });
};
