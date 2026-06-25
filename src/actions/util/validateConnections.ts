import {
  selectCompanyMember,
  selectTeam,
  selectProjectTaskTypes,
} from "../../services/db/index.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

type SequenceInput = { taskId: string };
type RelationshipInput = { taskId: string };

/**
 * Throws BAD_REQUEST unless every id in `userIds` is a member of the company.
 * No-op when `userIds` is undefined/empty. Used by the create/update endpoints
 * that link users (UserProject/UserClient/UserTask) so a bad id yields a clean
 * 400 instead of a foreign-key 500.
 */
export const validateCompanyMembers = async ({
  companyId,
  userIds,
}: {
  companyId: string;
  userIds?: string[];
}) => {
  if (!userIds?.length) return;
  const checks = await Promise.all(
    userIds.map((id) => selectCompanyMember({ userId: id, companyId })),
  );
  if (checks.some((check) => !check.exists)) {
    throw {
      status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
      error: ["One or more users don't belong to this company"],
    };
  }
};

/**
 * Throws BAD_REQUEST unless every id in `teamIds` is a (non-deleted) team of the
 * company. No-op when `teamIds` is undefined/empty. The team-link tables aren't
 * company-scoped at the DB level, so this guard prevents cross-company links.
 */
export const validateCompanyTeams = async ({
  companyId,
  teamIds,
}: {
  companyId: string;
  teamIds?: string[];
}) => {
  if (!teamIds?.length) return;
  const checks = await Promise.all(
    teamIds.map((teamId) => selectTeam({ teamId, companyId })),
  );
  if (checks.some((check) => !check.exists)) {
    throw {
      status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
      error: ["One or more teams don't belong to this company"],
    };
  }
};

/**
 * Validates the task-to-task references on a task/phase/milestone create/update:
 * every referenced id (parent phase, child tasks, sequence/relationship targets)
 * must be a non-deleted task in the same project; a `phaseId` must point at a
 * phase; phase `childTaskIds` must point at plain tasks. Throws BAD_REQUEST
 * otherwise. No-op when nothing is referenced.
 */
export const validateProjectTaskLinks = async ({
  projectId,
  phaseId,
  childTaskIds,
  sequences,
  relationships,
}: {
  projectId: string;
  phaseId?: string | null;
  childTaskIds?: string[];
  sequences?: SequenceInput[];
  relationships?: RelationshipInput[];
}) => {
  const refIds = new Set<string>();
  if (phaseId) refIds.add(phaseId);
  childTaskIds?.forEach((id) => refIds.add(id));
  sequences?.forEach((s) => refIds.add(s.taskId));
  relationships?.forEach((r) => refIds.add(r.taskId));
  if (!refIds.size) return;

  const types = await selectProjectTaskTypes({
    projectId,
    taskIds: [...refIds],
  });

  for (const id of refIds) {
    if (!types.has(id)) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["One or more linked tasks don't belong to this project"],
      };
    }
  }

  if (phaseId && types.get(phaseId) !== "phase") {
    throw {
      status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
      error: ["phaseId must reference a phase"],
    };
  }

  if (childTaskIds?.some((id) => types.get(id) !== "task")) {
    throw {
      status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
      error: ["Phase children must be tasks"],
    };
  }
};
