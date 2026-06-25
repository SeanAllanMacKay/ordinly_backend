import { and, eq, inArray } from "drizzle-orm";

import {
  db,
  Project,
  UserProject,
  UserClient,
  UserTask,
  AccessibleIds,
} from "../../index.js";

// Transaction handle type, derived from db.transaction's callback param so the
// connection helpers can run inside a parent transaction.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// --- asset-side reconcile (manage a project/client/task's assigned users) ----

/**
 * Reconcile a project's directly-assigned users (UserProject) from the project
 * create/update endpoints. `undefined` leaves the links untouched; a provided
 * array (even empty) is the desired set. The project's creator is always kept
 * assigned — `insertProject` adds them on create, so a submitted `userIds` that
 * omits them must not strip their access.
 */
export const reconcileUsersForProject = async (
  tx: Tx,
  {
    projectId,
    companyId,
    userId,
    userIds,
  }: {
    projectId: string;
    companyId: string;
    userId: string;
    userIds?: string[];
  },
) => {
  if (userIds === undefined) return;

  // Always retain the project's creator.
  const [project] = await tx
    .select({ createdBy: Project.createdBy })
    .from(Project)
    .where(eq(Project.id, projectId));
  const desired = new Set(userIds);
  if (project?.createdBy) desired.add(project.createdBy);

  const rows = await tx
    .select({ id: UserProject.userId })
    .from(UserProject)
    .where(
      and(
        eq(UserProject.projectId, projectId),
        eq(UserProject.companyId, companyId),
      ),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(UserProject)
      .values(
        toAdd.map((memberId) => ({
          userId: memberId,
          projectId,
          companyId,
          assignedBy: userId,
        })),
      );
  if (toRemove.length)
    await tx
      .delete(UserProject)
      .where(
        and(
          eq(UserProject.projectId, projectId),
          eq(UserProject.companyId, companyId),
          inArray(UserProject.userId, toRemove),
        ),
      );
};

/**
 * Reconcile a client's directly-assigned users (UserClient) from the client
 * create/update endpoints. `undefined` → no-op; a provided array is the desired
 * set.
 */
export const reconcileUsersForClient = async (
  tx: Tx,
  {
    clientId,
    companyId,
    userId,
    userIds,
  }: {
    clientId: string;
    companyId: string;
    userId: string;
    userIds?: string[];
  },
) => {
  if (userIds === undefined) return;

  const desired = new Set(userIds);
  const rows = await tx
    .select({ id: UserClient.userId })
    .from(UserClient)
    .where(
      and(
        eq(UserClient.clientId, clientId),
        eq(UserClient.companyId, companyId),
      ),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(UserClient)
      .values(
        toAdd.map((memberId) => ({
          userId: memberId,
          clientId,
          companyId,
          assignedBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(UserClient)
      .where(
        and(
          eq(UserClient.clientId, clientId),
          eq(UserClient.companyId, companyId),
          inArray(UserClient.userId, toRemove),
        ),
      );
};

/**
 * Reconcile a task's (or phase's) assigned users (UserTask) from the task/phase
 * endpoints. `undefined` → no-op; a provided array is the desired set.
 */
export const reconcileUsersForTask = async (
  tx: Tx,
  {
    taskId,
    companyId,
    userId,
    userIds,
  }: {
    taskId: string;
    companyId: string;
    userId: string;
    userIds?: string[];
  },
) => {
  if (userIds === undefined) return;

  const desired = new Set(userIds);
  const rows = await tx
    .select({ id: UserTask.userId })
    .from(UserTask)
    .where(
      and(eq(UserTask.taskId, taskId), eq(UserTask.companyId, companyId)),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(UserTask)
      .values(
        toAdd.map((memberId) => ({
          userId: memberId,
          taskId,
          companyId,
          assignedBy: userId,
        })),
      );
  if (toRemove.length)
    await tx
      .delete(UserTask)
      .where(
        and(
          eq(UserTask.taskId, taskId),
          eq(UserTask.companyId, companyId),
          inArray(UserTask.userId, toRemove),
        ),
      );
};

// --- user-side reconcile (manage a member's projects/clients) ----------------

/**
 * Reconcile which projects a member is assigned to (UserProject), from the
 * company-member update endpoint. Confined to the acting admin's accessible
 * projects, so omitting a project they can't see never unassigns it.
 */
export const reconcileProjectsForUser = async (
  tx: Tx,
  {
    memberId,
    companyId,
    userId,
    projectIds,
    projectAccess,
  }: {
    memberId: string;
    companyId: string;
    userId: string;
    projectIds?: string[];
    projectAccess: AccessibleIds;
  },
) => {
  if (projectIds === undefined) return;

  const accessible = new Set(projectAccess.ids);
  const desired = new Set(projectIds.filter((id) => accessible.has(id)));

  const rows = await tx
    .select({ id: UserProject.projectId })
    .from(UserProject)
    .where(
      and(
        eq(UserProject.userId, memberId),
        eq(UserProject.companyId, companyId),
      ),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessible.has(id) && !desired.has(id),
  );

  if (toAdd.length)
    await tx.insert(UserProject).values(
      toAdd.map((projectId) => ({
        userId: memberId,
        projectId,
        companyId,
        assignedBy: userId,
      })),
    );
  if (toRemove.length)
    await tx
      .delete(UserProject)
      .where(
        and(
          eq(UserProject.userId, memberId),
          eq(UserProject.companyId, companyId),
          inArray(UserProject.projectId, toRemove),
        ),
      );
};

/**
 * Reconcile which clients a member is assigned to (UserClient), from the
 * company-member update endpoint. Confined to the acting admin's accessible
 * clients.
 */
export const reconcileClientsForUser = async (
  tx: Tx,
  {
    memberId,
    companyId,
    userId,
    clientIds,
    clientAccess,
  }: {
    memberId: string;
    companyId: string;
    userId: string;
    clientIds?: string[];
    clientAccess: AccessibleIds;
  },
) => {
  if (clientIds === undefined) return;

  const accessible = new Set(clientAccess.ids);
  const desired = new Set(clientIds.filter((id) => accessible.has(id)));

  const rows = await tx
    .select({ id: UserClient.clientId })
    .from(UserClient)
    .where(
      and(
        eq(UserClient.userId, memberId),
        eq(UserClient.companyId, companyId),
      ),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessible.has(id) && !desired.has(id),
  );

  if (toAdd.length)
    await tx
      .insert(UserClient)
      .values(
        toAdd.map((clientId) => ({
          userId: memberId,
          clientId,
          companyId,
          assignedBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(UserClient)
      .where(
        and(
          eq(UserClient.userId, memberId),
          eq(UserClient.companyId, companyId),
          inArray(UserClient.clientId, toRemove),
        ),
      );
};
