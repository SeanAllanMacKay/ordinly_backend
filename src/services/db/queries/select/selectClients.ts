import { and, count, eq, exists, isNull } from "drizzle-orm";

import {
  db,
  Client,
  Contact,
  UserClient,
  selectOwnedContactInfoBatch,
} from "../../index.js";

export type SelectClientsProps = {
  userId: string;
  companyId: string;
  /** When true, restrict to clients the user is assigned to (assigned_* tier). */
  assignedOnly?: boolean;
  page?: number;
  pageSize?: number;
};

// Lists a company's (non-deleted) clients, paginated, each with a contact count
// and its own phone/email/location info. When assignedOnly is set, only clients
// the user is assigned to (UserClient) are returned.
export const selectClients = async ({
  userId,
  companyId,
  assignedOnly = false,
  page = 1,
  pageSize = 15,
}: SelectClientsProps) => {
  const buildConditions = (clientId: typeof Client.id) =>
    and(
      eq(Client.companyId, companyId),
      isNull(Client.deletedDate),
      assignedOnly
        ? exists(
            db
              .select()
              .from(UserClient)
              .where(
                and(
                  eq(UserClient.clientId, clientId),
                  eq(UserClient.userId, userId),
                ),
              ),
          )
        : undefined,
    );

  const [{ totalItems }] = await db
    .select({ totalItems: count() })
    .from(Client)
    .where(buildConditions(Client.id));

  const clients = await db.query.Client.findMany({
    where: (client) => buildConditions(client.id),
    with: {
      contacts: {
        where: isNull(Contact.deletedDate),
        columns: { id: true },
      },
    },
    orderBy: (client, { desc }) => desc(client.createdDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const infoMap = await selectOwnedContactInfoBatch({
    ownerType: "client",
    ownerIds: clients.map((client) => client.id),
  });

  const hydrated = clients.map(({ contacts, ...client }) => ({
    ...client,
    contactCount: contacts.length,
    ...infoMap[client.id],
  }));

  return {
    clients: hydrated,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
