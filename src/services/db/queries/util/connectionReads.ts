import { and, eq, inArray, isNull, or } from "drizzle-orm";

import {
  db,
  User,
  Team,
  Task,
  UserProject,
  UserClient,
  UserTask,
  ProjectTeam,
  ClientTeam,
  TaskTeam,
  TeamMember,
  TaskSequence,
  TaskRelationship,
  AccessibleIds,
} from "../../index.js";

// Columns safe to expose for a linked user (never the password / verification code).
const userColumns = {
  id: User.id,
  name: User.name,
  email: User.email,
  isVerified: User.isVerified,
};

// Slim task summary used when surfacing linked/related tasks.
const taskSummaryColumns = {
  id: Task.id,
  name: Task.name,
  type: Task.type,
  status: Task.status,
  priority: Task.priority,
  startDate: Task.startDate,
  dueDate: Task.dueDate,
};

// --- assignees (users) -------------------------------------------------------

/** Users directly assigned to a project (UserProject). */
export const selectUsersForProject = async ({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}) =>
  db
    .select(userColumns)
    .from(UserProject)
    .innerJoin(User, eq(User.id, UserProject.userId))
    .where(
      and(
        eq(UserProject.projectId, projectId),
        eq(UserProject.companyId, companyId),
        isNull(User.deletedDate),
      ),
    );

/** Users directly assigned to a client (UserClient). */
export const selectUsersForClient = async ({
  clientId,
  companyId,
}: {
  clientId: string;
  companyId: string;
}) =>
  db
    .select(userColumns)
    .from(UserClient)
    .innerJoin(User, eq(User.id, UserClient.userId))
    .where(
      and(
        eq(UserClient.clientId, clientId),
        eq(UserClient.companyId, companyId),
        isNull(User.deletedDate),
      ),
    );

/** Users directly assigned to a task/phase (UserTask). */
export const selectUsersForTask = async ({
  taskId,
  companyId,
}: {
  taskId: string;
  companyId: string;
}) =>
  db
    .select(userColumns)
    .from(UserTask)
    .innerJoin(User, eq(User.id, UserTask.userId))
    .where(
      and(
        eq(UserTask.taskId, taskId),
        eq(UserTask.companyId, companyId),
        isNull(User.deletedDate),
      ),
    );

// --- linked teams ------------------------------------------------------------

const teamColumns = {
  id: Team.id,
  name: Team.name,
  description: Team.description,
};

/** Teams linked to a project (ProjectTeam). */
export const selectTeamsForProject = async ({
  projectId,
}: {
  projectId: string;
}) =>
  db
    .select(teamColumns)
    .from(ProjectTeam)
    .innerJoin(Team, eq(Team.id, ProjectTeam.teamId))
    .where(and(eq(ProjectTeam.projectId, projectId), isNull(Team.deletedDate)));

/** Teams linked to a client (ClientTeam). */
export const selectTeamsForClient = async ({ clientId }: { clientId: string }) =>
  db
    .select(teamColumns)
    .from(ClientTeam)
    .innerJoin(Team, eq(Team.id, ClientTeam.teamId))
    .where(and(eq(ClientTeam.clientId, clientId), isNull(Team.deletedDate)));

/** Teams linked to a task/phase (TaskTeam). */
export const selectTeamsForTask = async ({ taskId }: { taskId: string }) =>
  db
    .select(teamColumns)
    .from(TaskTeam)
    .innerJoin(Team, eq(Team.id, TaskTeam.teamId))
    .where(and(eq(TaskTeam.taskId, taskId), isNull(Team.deletedDate)));

/** Teams a member belongs to (TeamMember) within a company. */
export const selectTeamsForMember = async ({
  memberId,
  companyId,
}: {
  memberId: string;
  companyId: string;
}) =>
  db
    .select({ id: Team.id, name: Team.name, description: Team.description })
    .from(TeamMember)
    .innerJoin(Team, eq(Team.id, TeamMember.teamId))
    .where(
      and(
        eq(TeamMember.userId, memberId),
        eq(Team.companyId, companyId),
        isNull(TeamMember.deletedDate),
        isNull(Team.deletedDate),
      ),
    );

// --- a member's / team's linked projects + clients (access-scoped) -----------

/** Projects a member is assigned to (UserProject), filtered to the caller's scope. */
export const selectProjectsForMember = async ({
  memberId,
  companyId,
  projectAccess,
}: {
  memberId: string;
  companyId: string;
  projectAccess: AccessibleIds;
}) => {
  if (!projectAccess.all && !projectAccess.ids.length) return [];
  return db.query.Project.findMany({
    where: (project, { and, eq, isNull, inArray, exists }) =>
      and(
        isNull(project.deletedDate),
        projectAccess.all ? undefined : inArray(project.id, projectAccess.ids),
        exists(
          db
            .select()
            .from(UserProject)
            .where(
              and(
                eq(UserProject.projectId, project.id),
                eq(UserProject.userId, memberId),
                eq(UserProject.companyId, companyId),
              ),
            ),
        ),
      ),
  });
};

/** Clients a member is assigned to (UserClient), filtered to the caller's scope. */
export const selectClientsForMember = async ({
  memberId,
  companyId,
  clientAccess,
}: {
  memberId: string;
  companyId: string;
  clientAccess: AccessibleIds;
}) => {
  if (!clientAccess.all && !clientAccess.ids.length) return [];
  return db.query.Client.findMany({
    where: (client, { and, eq, isNull, inArray, exists }) =>
      and(
        eq(client.companyId, companyId),
        isNull(client.deletedDate),
        clientAccess.all ? undefined : inArray(client.id, clientAccess.ids),
        exists(
          db
            .select()
            .from(UserClient)
            .where(
              and(
                eq(UserClient.clientId, client.id),
                eq(UserClient.userId, memberId),
                eq(UserClient.companyId, companyId),
              ),
            ),
        ),
      ),
  });
};

/** Projects a team is linked to (ProjectTeam), filtered to the caller's scope. */
export const selectProjectsForTeam = async ({
  teamId,
  projectAccess,
}: {
  teamId: string;
  projectAccess: AccessibleIds;
}) => {
  if (!projectAccess.all && !projectAccess.ids.length) return [];
  return db.query.Project.findMany({
    where: (project, { and, eq, isNull, inArray, exists }) =>
      and(
        isNull(project.deletedDate),
        projectAccess.all ? undefined : inArray(project.id, projectAccess.ids),
        exists(
          db
            .select()
            .from(ProjectTeam)
            .where(
              and(
                eq(ProjectTeam.projectId, project.id),
                eq(ProjectTeam.teamId, teamId),
              ),
            ),
        ),
      ),
  });
};

/** Clients a team is linked to (ClientTeam), filtered to the caller's scope. */
export const selectClientsForTeam = async ({
  teamId,
  companyId,
  clientAccess,
}: {
  teamId: string;
  companyId: string;
  clientAccess: AccessibleIds;
}) => {
  if (!clientAccess.all && !clientAccess.ids.length) return [];
  return db.query.Client.findMany({
    where: (client, { and, eq, isNull, inArray, exists }) =>
      and(
        eq(client.companyId, companyId),
        isNull(client.deletedDate),
        clientAccess.all ? undefined : inArray(client.id, clientAccess.ids),
        exists(
          db
            .select()
            .from(ClientTeam)
            .where(
              and(
                eq(ClientTeam.clientId, client.id),
                eq(ClientTeam.teamId, teamId),
              ),
            ),
        ),
      ),
  });
};

// --- task graph (parent phase, children, sequences, relationships) -----------

/**
 * Load a task's structural links: its parent phase, its child tasks (when it's a
 * phase), and its sequence/relationship links — each expressed relative to this
 * task (matching the create/update input shape) with a slim summary of the other
 * task.
 */
export const selectTaskGraph = async ({
  taskId,
  parentTaskId,
}: {
  taskId: string;
  parentTaskId?: string | null;
}) => {
  const parentPhase = parentTaskId
    ? ((
        await db
          .select({ id: Task.id, name: Task.name, type: Task.type })
          .from(Task)
          .where(and(eq(Task.id, parentTaskId), isNull(Task.deletedDate)))
      )[0] ?? null)
    : null;

  const children = await db
    .select(taskSummaryColumns)
    .from(Task)
    .where(and(eq(Task.parentTaskId, taskId), isNull(Task.deletedDate)));

  const seqRows = await db
    .select({
      id: TaskSequence.id,
      type: TaskSequence.type,
      lagOffset: TaskSequence.lagOffset,
      predecessorId: TaskSequence.predecessorId,
      successorId: TaskSequence.successorId,
    })
    .from(TaskSequence)
    .where(
      or(
        eq(TaskSequence.predecessorId, taskId),
        eq(TaskSequence.successorId, taskId),
      ),
    );

  const relRows = await db
    .select({
      id: TaskRelationship.id,
      type: TaskRelationship.type,
      fromId: TaskRelationship.fromId,
      toId: TaskRelationship.toId,
    })
    .from(TaskRelationship)
    .where(
      or(
        eq(TaskRelationship.fromId, taskId),
        eq(TaskRelationship.toId, taskId),
      ),
    );

  // Resolve the "other" task summary for every link in one round-trip.
  const otherIds = [
    ...new Set([
      ...seqRows.map((r) => (r.predecessorId === taskId ? r.successorId : r.predecessorId)),
      ...relRows.map((r) => (r.fromId === taskId ? r.toId : r.fromId)),
    ]),
  ];
  const summaries = otherIds.length
    ? await db
        .select({ id: Task.id, name: Task.name, type: Task.type })
        .from(Task)
        .where(inArray(Task.id, otherIds))
    : [];
  const summaryById = new Map(summaries.map((s) => [s.id, s]));

  const sequences = seqRows.map((r) => {
    const isSuccessor = r.successorId === taskId;
    const otherId = isSuccessor ? r.predecessorId : r.successorId;
    return {
      id: r.id,
      type: r.type,
      lagOffset: r.lagOffset,
      // Relative to this task: the other task is its predecessor or successor.
      direction: isSuccessor ? "predecessor" : "successor",
      task: summaryById.get(otherId) ?? null,
    };
  });

  const relationships = relRows.map((r) => {
    const isFrom = r.fromId === taskId;
    const otherId = isFrom ? r.toId : r.fromId;
    return {
      id: r.id,
      type: r.type,
      direction: isFrom ? "from" : "to",
      task: summaryById.get(otherId) ?? null,
    };
  });

  return { parentPhase, children, sequences, relationships };
};
