import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Client,
  replaceOwnedContactInfo,
  OwnedContactInfoInput,
  reconcileProjectsForClient,
  reconcileUsersForClient,
  reconcileTeamsForClient,
  AccessibleIds,
} from "../../index.js";

export type UpdateClientProps = {
  clientId: string;
  companyId: string;
  userId: string;
  name?: string;
  description?: string;
  clientCompanyId?: string;
  clientUserId?: string;
  projectIds?: string[];
  userIds?: string[];
  teamIds?: string[];
  projectAccess?: AccessibleIds;
} & OwnedContactInfoInput;

// Updates a client's fields and, when a phone/email/location array is provided,
// reconciles that set (provided → replace, omitted → leave as-is). Scoped by
// companyId. Returns the updated client, or undefined if not in the company.
export const updateClient = async ({
  clientId,
  companyId,
  userId,
  name,
  description,
  clientCompanyId,
  clientUserId,
  phoneNumbers,
  emails,
  locations,
  projectIds,
  userIds,
  teamIds,
  projectAccess,
}: UpdateClientProps) => {
  return await db.transaction(async (tx) => {
    const [client] = await tx
      .update(Client)
      .set({
        name,
        description,
        clientCompanyId,
        clientUserId,
        updatedDate: new Date(),
        updatedBy: userId,
      })
      .where(
        and(
          eq(Client.id, clientId),
          eq(Client.companyId, companyId),
          isNull(Client.deletedDate),
        ),
      )
      .returning();

    if (!client) return undefined;

    await replaceOwnedContactInfo(tx, {
      ownerType: "client",
      ownerId: client.id,
      userId,
      phoneNumbers,
      emails,
      locations,
    });

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
