import { and, eq, inArray, isNull } from "drizzle-orm";

import {
  db,
  Client,
  Contact,
  ProjectClient,
  ProjectContact,
  UserClient,
  UserProject,
  resolveCompanyPermissions,
} from "../../index.js";

// Transaction handle type, derived from db.transaction's callback param so the
// connection helpers can run inside a parent transaction.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * The set of entity ids of one type (clients or projects) a user may see/connect
 * within a company. `all` is true when the user has the all_* read tier (or is
 * owner), in which case every company entity is visible and `ids` lists them.
 * Otherwise `ids` is the user's assigned subset. `canRead` distinguishes "has a
 * read tier but the set happens to be empty" from "no read permission at all".
 */
export type AccessibleIds = {
  all: boolean;
  canRead: boolean;
  ids: string[];
};

const dedupe = (ids: string[]) => [...new Set(ids)];

/**
 * Resolve which clients a user may see/connect in a company. all_clients.read
 * (or owner) → every non-deleted company client; only assigned_clients.read →
 * the user's UserClient subset; neither → not readable, empty.
 */
export const getAccessibleClientIds = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}): Promise<AccessibleIds> => {
  const { isOwner, permissions } = await resolveCompanyPermissions({
    userId,
    companyId,
  });
  const canAll = isOwner || !!permissions["all_clients"]?.read;
  const canAssigned = isOwner || !!permissions["assigned_clients"]?.read;

  if (canAll) {
    const rows = await db
      .select({ id: Client.id })
      .from(Client)
      .where(and(eq(Client.companyId, companyId), isNull(Client.deletedDate)));
    return { all: true, canRead: true, ids: rows.map((r) => r.id) };
  }

  if (!canAssigned) return { all: false, canRead: false, ids: [] };

  const rows = await db
    .select({ id: UserClient.clientId })
    .from(UserClient)
    .innerJoin(Client, eq(Client.id, UserClient.clientId))
    .where(
      and(
        eq(UserClient.userId, userId),
        eq(Client.companyId, companyId),
        isNull(Client.deletedDate),
      ),
    );
  return { all: false, canRead: true, ids: dedupe(rows.map((r) => r.id)) };
};

/**
 * Resolve which projects a user may see/connect in a company. all_projects.read
 * (or owner) → every project the company owns (via CompanyProject); only
 * assigned_projects.read → the user's UserProject subset; neither → empty.
 */
export const getAccessibleProjectIds = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}): Promise<AccessibleIds> => {
  const { isOwner, permissions } = await resolveCompanyPermissions({
    userId,
    companyId,
  });
  const canAll = isOwner || !!permissions["all_projects"]?.read;
  const canAssigned = isOwner || !!permissions["assigned_projects"]?.read;

  if (canAll) {
    // Every project the company owns / is linked to, via CompanyProject.
    const projects = await db.query.CompanyProject.findMany({
      where: (cp, { eq }) => eq(cp.companyId, companyId),
      columns: { projectId: true },
    });
    return {
      all: true,
      canRead: true,
      ids: dedupe(projects.map((p) => p.projectId)),
    };
  }

  if (!canAssigned) return { all: false, canRead: false, ids: [] };

  const rows = await db
    .select({ id: UserProject.projectId })
    .from(UserProject)
    .where(
      and(eq(UserProject.userId, userId), eq(UserProject.companyId, companyId)),
    );
  return { all: false, canRead: true, ids: dedupe(rows.map((r) => r.id)) };
};

// --- internal helpers -------------------------------------------------------

// Accessible contacts = contacts whose parent client is accessible. Returns the
// id set plus a contactId → clientId map (for client-coupling).
const loadAccessibleContacts = async (
  tx: Tx,
  { companyId, accessibleClientIds }: { companyId: string; accessibleClientIds: string[] },
) => {
  if (!accessibleClientIds.length)
    return { ids: new Set<string>(), parent: new Map<string, string>() };

  const rows = await tx
    .select({ id: Contact.id, clientId: Contact.clientId })
    .from(Contact)
    .where(
      and(
        eq(Contact.companyId, companyId),
        isNull(Contact.deletedDate),
        inArray(Contact.clientId, accessibleClientIds),
      ),
    );

  return {
    ids: new Set(rows.map((r) => r.id)),
    parent: new Map(rows.map((r) => [r.id, r.clientId] as const)),
  };
};

const currentProjectClientIds = async (tx: Tx, projectId: string) => {
  const rows = await tx
    .select({ id: ProjectClient.clientId })
    .from(ProjectClient)
    .where(eq(ProjectClient.projectId, projectId));
  return new Set(rows.map((r) => r.id));
};

const currentProjectContactIds = async (tx: Tx, projectId: string) => {
  const rows = await tx
    .select({ id: ProjectContact.contactId })
    .from(ProjectContact)
    .where(eq(ProjectContact.projectId, projectId));
  return new Set(rows.map((r) => r.id));
};

// Delete the ProjectContact rows for a project whose contacts belong to any of
// the given (just-unlinked) clients — enforces "unassign client ⇒ unassign its
// contacts".
const removeContactsOfClients = async (
  tx: Tx,
  { projectId, clientIds }: { projectId: string; clientIds: string[] },
) => {
  if (!clientIds.length) return;
  const contacts = await tx
    .select({ id: Contact.id })
    .from(Contact)
    .where(inArray(Contact.clientId, clientIds));
  const contactIds = contacts.map((c) => c.id);
  if (!contactIds.length) return;
  await tx
    .delete(ProjectContact)
    .where(
      and(
        eq(ProjectContact.projectId, projectId),
        inArray(ProjectContact.contactId, contactIds),
      ),
    );
};

// --- project-side reconcile -------------------------------------------------

/**
 * Reconcile a project's client AND contact links from the project create/update
 * endpoints. `clientIds`/`contactIds` are the submitted arrays — an `undefined`
 * array leaves that link type untouched; a provided array (even empty) is the
 * desired set. All changes are confined to the user's accessible sets, so omits
 * of links the user can't see never remove them.
 *
 * Coupling: a desired contact forces its parent client to stay/added; removing a
 * client cascades removal of its contacts.
 */
export const reconcileProjectConnectionsForProject = async (
  tx: Tx,
  {
    projectId,
    companyId,
    userId,
    clientIds,
    contactIds,
    clientAccess,
  }: {
    projectId: string;
    companyId: string;
    userId: string;
    clientIds?: string[];
    contactIds?: string[];
    clientAccess: AccessibleIds;
  },
) => {
  const hasClients = clientIds !== undefined;
  const hasContacts = contactIds !== undefined;
  if (!hasClients && !hasContacts) return;

  const accessibleClients = new Set(clientAccess.ids);
  const { ids: accessibleContacts, parent: contactParent } =
    await loadAccessibleContacts(tx, {
      companyId,
      accessibleClientIds: clientAccess.ids,
    });

  // Sanitise submitted ids down to what the user may actually touch.
  const desiredContacts = new Set(
    (contactIds ?? []).filter((id) => accessibleContacts.has(id)),
  );
  // Parent clients of every desired contact (coupling) — always accessible
  // since the contact itself is accessible only through its parent.
  const coupledParents = new Set<string>();
  for (const contactId of desiredContacts) {
    const parent = contactParent.get(contactId);
    if (parent) coupledParents.add(parent);
  }

  const current = await currentProjectClientIds(tx, projectId);
  const currentContacts = await currentProjectContactIds(tx, projectId);

  // ----- clients -----
  let removedClients: string[] = [];
  if (hasClients) {
    const desiredClients = new Set(
      (clientIds ?? []).filter((id) => accessibleClients.has(id)),
    );
    for (const parent of coupledParents) desiredClients.add(parent);

    const toAdd = [...desiredClients].filter((id) => !current.has(id));
    removedClients = [...current].filter(
      (id) => accessibleClients.has(id) && !desiredClients.has(id),
    );

    if (toAdd.length)
      await tx
        .insert(ProjectClient)
        .values(
          toAdd.map((clientId) => ({ projectId, clientId, companyId, createdBy: userId })),
        )
        .onConflictDoNothing();
    if (removedClients.length) {
      await tx
        .delete(ProjectClient)
        .where(
          and(
            eq(ProjectClient.projectId, projectId),
            inArray(ProjectClient.clientId, removedClients),
          ),
        );
      await removeContactsOfClients(tx, { projectId, clientIds: removedClients });
    }
  } else if (coupledParents.size) {
    // Clients not submitted, but new contacts require their parents linked.
    const toAdd = [...coupledParents].filter((id) => !current.has(id));
    if (toAdd.length)
      await tx
        .insert(ProjectClient)
        .values(
          toAdd.map((clientId) => ({ projectId, clientId, companyId, createdBy: userId })),
        )
        .onConflictDoNothing();
  }

  // ----- contacts -----
  if (hasContacts) {
    const toAdd = [...desiredContacts].filter((id) => !currentContacts.has(id));
    const toRemove = [...currentContacts].filter(
      (id) => accessibleContacts.has(id) && !desiredContacts.has(id),
    );

    if (toAdd.length)
      await tx
        .insert(ProjectContact)
        .values(
          toAdd.map((contactId) => ({ projectId, contactId, companyId, createdBy: userId })),
        )
        .onConflictDoNothing();
    if (toRemove.length)
      await tx
        .delete(ProjectContact)
        .where(
          and(
            eq(ProjectContact.projectId, projectId),
            inArray(ProjectContact.contactId, toRemove),
          ),
        );
  }
};

// --- client-side reconcile --------------------------------------------------

/**
 * Reconcile which projects a client is linked to, from the client create/update
 * endpoints. Confined to the user's accessible projects. Removing a project link
 * cascades removal of that client's contacts from the project.
 */
export const reconcileProjectsForClient = async (
  tx: Tx,
  {
    clientId,
    companyId,
    userId,
    projectIds,
    projectAccess,
  }: {
    clientId: string;
    companyId: string;
    userId: string;
    projectIds?: string[];
    projectAccess: AccessibleIds;
  },
) => {
  if (projectIds === undefined) return;

  const accessibleProjects = new Set(projectAccess.ids);
  const desired = new Set(projectIds.filter((id) => accessibleProjects.has(id)));

  const rows = await tx
    .select({ id: ProjectClient.projectId })
    .from(ProjectClient)
    .where(eq(ProjectClient.clientId, clientId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessibleProjects.has(id) && !desired.has(id),
  );

  if (toAdd.length)
    await tx
      .insert(ProjectClient)
      .values(
        toAdd.map((projectId) => ({ projectId, clientId, companyId, createdBy: userId })),
      )
      .onConflictDoNothing();

  if (toRemove.length) {
    await tx
      .delete(ProjectClient)
      .where(
        and(
          eq(ProjectClient.clientId, clientId),
          inArray(ProjectClient.projectId, toRemove),
        ),
      );
    // Cascade: this client's contacts come off those projects too.
    for (const projectId of toRemove)
      await removeContactsOfClients(tx, { projectId, clientIds: [clientId] });
  }
};

// --- contact-side reconcile -------------------------------------------------

/**
 * Reconcile which projects a contact is linked to, from the contact create/update
 * endpoints. Confined to the user's accessible projects. Linking a contact to a
 * project also ensures its parent client is linked (coupling).
 */
export const reconcileProjectsForContact = async (
  tx: Tx,
  {
    contactId,
    clientId,
    companyId,
    userId,
    projectIds,
    projectAccess,
  }: {
    contactId: string;
    clientId: string;
    companyId: string;
    userId: string;
    projectIds?: string[];
    projectAccess: AccessibleIds;
  },
) => {
  if (projectIds === undefined) return;

  const accessibleProjects = new Set(projectAccess.ids);
  const desired = new Set(projectIds.filter((id) => accessibleProjects.has(id)));

  const rows = await tx
    .select({ id: ProjectContact.projectId })
    .from(ProjectContact)
    .where(eq(ProjectContact.contactId, contactId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessibleProjects.has(id) && !desired.has(id),
  );

  if (toAdd.length) {
    await tx
      .insert(ProjectContact)
      .values(
        toAdd.map((projectId) => ({ projectId, contactId, companyId, createdBy: userId })),
      )
      .onConflictDoNothing();
    // Coupling: ensure the parent client is linked to each of those projects.
    await tx
      .insert(ProjectClient)
      .values(
        toAdd.map((projectId) => ({ projectId, clientId, companyId, createdBy: userId })),
      )
      .onConflictDoNothing();
  }

  if (toRemove.length)
    await tx
      .delete(ProjectContact)
      .where(
        and(
          eq(ProjectContact.contactId, contactId),
          inArray(ProjectContact.projectId, toRemove),
        ),
      );
};

// --- read helper ------------------------------------------------------------

/**
 * Load a project's connected clients and contacts, filtered to what the caller
 * may see (their accessible client set; contacts inherit their client's
 * visibility). Used by getProject.
 */
export const selectProjectConnections = async ({
  projectId,
  companyId,
  clientAccess,
}: {
  projectId: string;
  companyId: string;
  clientAccess: AccessibleIds;
}) => {
  if (!clientAccess.all && !clientAccess.ids.length)
    return { clients: [], contacts: [] };

  const clients = await db.query.Client.findMany({
    where: (client, { and, eq, isNull, inArray, exists }) =>
      and(
        eq(client.companyId, companyId),
        isNull(client.deletedDate),
        clientAccess.all ? undefined : inArray(client.id, clientAccess.ids),
        exists(
          db
            .select()
            .from(ProjectClient)
            .where(
              and(
                eq(ProjectClient.projectId, projectId),
                eq(ProjectClient.clientId, client.id),
              ),
            ),
        ),
      ),
  });

  const contacts = await db.query.Contact.findMany({
    where: (contact, { and, eq, isNull, inArray, exists }) =>
      and(
        eq(contact.companyId, companyId),
        isNull(contact.deletedDate),
        clientAccess.all ? undefined : inArray(contact.clientId, clientAccess.ids),
        exists(
          db
            .select()
            .from(ProjectContact)
            .where(
              and(
                eq(ProjectContact.projectId, projectId),
                eq(ProjectContact.contactId, contact.id),
              ),
            ),
        ),
      ),
  });

  return { clients, contacts };
};

/**
 * Load the (non-deleted) projects a client is connected to, filtered to the
 * caller's accessible projects. Used by getClient.
 */
export const selectProjectsForClient = async ({
  clientId,
  projectAccess,
}: {
  clientId: string;
  projectAccess: AccessibleIds;
}) => {
  if (!projectAccess.all && !projectAccess.ids.length) return [];

  return await db.query.Project.findMany({
    where: (project, { and, eq, isNull, inArray, exists }) =>
      and(
        isNull(project.deletedDate),
        projectAccess.all ? undefined : inArray(project.id, projectAccess.ids),
        exists(
          db
            .select()
            .from(ProjectClient)
            .where(
              and(
                eq(ProjectClient.projectId, project.id),
                eq(ProjectClient.clientId, clientId),
              ),
            ),
        ),
      ),
  });
};

/**
 * Load the (non-deleted) projects a contact is connected to, filtered to the
 * caller's accessible projects. Used by getContact.
 */
export const selectProjectsForContact = async ({
  contactId,
  projectAccess,
}: {
  contactId: string;
  projectAccess: AccessibleIds;
}) => {
  if (!projectAccess.all && !projectAccess.ids.length) return [];

  return await db.query.Project.findMany({
    where: (project, { and, eq, isNull, inArray, exists }) =>
      and(
        isNull(project.deletedDate),
        projectAccess.all ? undefined : inArray(project.id, projectAccess.ids),
        exists(
          db
            .select()
            .from(ProjectContact)
            .where(
              and(
                eq(ProjectContact.projectId, project.id),
                eq(ProjectContact.contactId, contactId),
              ),
            ),
        ),
      ),
  });
};
