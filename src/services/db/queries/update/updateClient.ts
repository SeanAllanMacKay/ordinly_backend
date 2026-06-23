import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Client,
  replaceOwnedContactInfo,
  OwnedContactInfoInput,
} from "../../index.js";

export type UpdateClientProps = {
  clientId: string;
  companyId: string;
  userId: string;
  name?: string;
  description?: string;
  clientCompanyId?: string;
  clientUserId?: string;
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

    return client;
  });
};
