import { and, eq, inArray, isNull, notInArray } from "drizzle-orm";

import {
  db,
  Team,
  TeamMember,
  ProjectTeam,
  ClientTeam,
  TaskTeam,
  AccessibleIds,
} from "../../index.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// --- asset-side reconcile (manage a project/client/task's linked teams) ------

/**
 * Reconcile a project's linked teams (ProjectTeam). Pure association links —
 * `undefined` → no-op; a provided array (even empty) is the desired set. Team
 * ids are validated against the company in the action.
 */
export const reconcileTeamsForProject = async (
  tx: Tx,
  {
    projectId,
    companyId,
    userId,
    teamIds,
  }: {
    projectId: string;
    companyId: string;
    userId: string;
    teamIds?: string[];
  },
) => {
  if (teamIds === undefined) return;

  const desired = new Set(teamIds);
  const rows = await tx
    .select({ id: ProjectTeam.teamId })
    .from(ProjectTeam)
    .where(eq(ProjectTeam.projectId, projectId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(ProjectTeam)
      .values(
        toAdd.map((teamId) => ({
          teamId,
          projectId,
          companyId,
          createdBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(ProjectTeam)
      .where(
        and(
          eq(ProjectTeam.projectId, projectId),
          inArray(ProjectTeam.teamId, toRemove),
        ),
      );
};

/** Reconcile a client's linked teams (ClientTeam). */
export const reconcileTeamsForClient = async (
  tx: Tx,
  {
    clientId,
    companyId,
    userId,
    teamIds,
  }: {
    clientId: string;
    companyId: string;
    userId: string;
    teamIds?: string[];
  },
) => {
  if (teamIds === undefined) return;

  const desired = new Set(teamIds);
  const rows = await tx
    .select({ id: ClientTeam.teamId })
    .from(ClientTeam)
    .where(eq(ClientTeam.clientId, clientId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(ClientTeam)
      .values(
        toAdd.map((teamId) => ({
          teamId,
          clientId,
          companyId,
          createdBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(ClientTeam)
      .where(
        and(
          eq(ClientTeam.clientId, clientId),
          inArray(ClientTeam.teamId, toRemove),
        ),
      );
};

/** Reconcile a task's (or phase's) linked teams (TaskTeam). */
export const reconcileTeamsForTask = async (
  tx: Tx,
  {
    taskId,
    companyId,
    userId,
    teamIds,
  }: {
    taskId: string;
    companyId: string;
    userId: string;
    teamIds?: string[];
  },
) => {
  if (teamIds === undefined) return;

  const desired = new Set(teamIds);
  const rows = await tx
    .select({ id: TaskTeam.teamId })
    .from(TaskTeam)
    .where(eq(TaskTeam.taskId, taskId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length)
    await tx
      .insert(TaskTeam)
      .values(
        toAdd.map((teamId) => ({
          teamId,
          taskId,
          companyId,
          createdBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(TaskTeam)
      .where(
        and(eq(TaskTeam.taskId, taskId), inArray(TaskTeam.teamId, toRemove)),
      );
};

// --- team-side reconcile (manage a team's linked projects/clients) -----------

/**
 * Reconcile which projects a team is linked to (ProjectTeam), from the team
 * create/update endpoints. Confined to the acting user's accessible projects.
 */
export const reconcileProjectsForTeam = async (
  tx: Tx,
  {
    teamId,
    companyId,
    userId,
    projectIds,
    projectAccess,
  }: {
    teamId: string;
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
    .select({ id: ProjectTeam.projectId })
    .from(ProjectTeam)
    .where(eq(ProjectTeam.teamId, teamId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessible.has(id) && !desired.has(id),
  );

  if (toAdd.length)
    await tx
      .insert(ProjectTeam)
      .values(
        toAdd.map((projectId) => ({
          teamId,
          projectId,
          companyId,
          createdBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(ProjectTeam)
      .where(
        and(
          eq(ProjectTeam.teamId, teamId),
          inArray(ProjectTeam.projectId, toRemove),
        ),
      );
};

/**
 * Reconcile which clients a team is linked to (ClientTeam), from the team
 * create/update endpoints. Confined to the acting user's accessible clients.
 */
export const reconcileClientsForTeam = async (
  tx: Tx,
  {
    teamId,
    companyId,
    userId,
    clientIds,
    clientAccess,
  }: {
    teamId: string;
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
    .select({ id: ClientTeam.clientId })
    .from(ClientTeam)
    .where(eq(ClientTeam.teamId, teamId));
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter(
    (id) => accessible.has(id) && !desired.has(id),
  );

  if (toAdd.length)
    await tx
      .insert(ClientTeam)
      .values(
        toAdd.map((clientId) => ({
          teamId,
          clientId,
          companyId,
          createdBy: userId,
        })),
      )
      .onConflictDoNothing();
  if (toRemove.length)
    await tx
      .delete(ClientTeam)
      .where(
        and(
          eq(ClientTeam.teamId, teamId),
          inArray(ClientTeam.clientId, toRemove),
        ),
      );
};

// --- user-side reconcile of team membership ----------------------------------

/**
 * Reconcile which teams a member belongs to (TeamMember), from the company-member
 * update endpoint — the user side of Users↔Teams. Soft-deletes/reactivates to
 * match the team-side `updateTeam` query. Scoped to teams owned by the company so
 * a member's memberships in other companies are never touched.
 */
export const reconcileTeamsForUser = async (
  tx: Tx,
  {
    memberId,
    companyId,
    userId,
    teamIds,
  }: {
    memberId: string;
    companyId: string;
    userId: string;
    teamIds?: string[];
  },
) => {
  if (teamIds === undefined) return;

  // Restrict the reconcile to this company's (non-deleted) teams.
  const companyTeams = await tx
    .select({ id: Team.id })
    .from(Team)
    .where(and(eq(Team.companyId, companyId), isNull(Team.deletedDate)));
  const companyTeamIds = companyTeams.map((t) => t.id);
  if (!companyTeamIds.length) return;

  const desired = companyTeamIds.filter((id) => teamIds.includes(id));

  // Soft-delete memberships in this company's teams that are no longer desired.
  await tx
    .update(TeamMember)
    .set({ deletedDate: new Date(), deletedBy: userId })
    .where(
      and(
        eq(TeamMember.userId, memberId),
        isNull(TeamMember.deletedDate),
        inArray(TeamMember.teamId, companyTeamIds),
        desired.length ? notInArray(TeamMember.teamId, desired) : undefined,
      ),
    );

  // (Re)activate the desired memberships.
  for (const teamId of desired) {
    await tx
      .insert(TeamMember)
      .values({ teamId, userId: memberId, assignedBy: userId })
      .onConflictDoUpdate({
        target: [TeamMember.teamId, TeamMember.userId],
        set: {
          deletedDate: null,
          deletedBy: null,
          assignedBy: userId,
          assignedDate: new Date(),
        },
      });
  }
};
