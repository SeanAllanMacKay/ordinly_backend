import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { randomUUID as uuid } from "crypto";
import {
  insertProjectTask,
  updateProjectTask as updateProjectTaskQuery,
  selectProjectTask,
  selectProjectTasks,
  deleteProjectTask as deleteProjectTaskQuery,
  isProjectInCompany,
  resolveCompanyPermissions,
  selectUsersForTask,
  selectTeamsForTask,
  selectTaskGraph,
} from "../../services/db/index.js";
import {
  assertCompanyPermission,
  assertCompanyAssetPermission,
} from "../permissions/index.js";
import {
  validateCompanyMembers,
  validateCompanyTeams,
  validateProjectTaskLinks,
} from "../util/validateConnections.js";
import { taskLinkFields } from "./taskLinkSchemas.js";
import { fileService } from "../../services/files/index.js";
import * as z from "zod";

// A phase is a Task with type='phase'. Phases own child tasks (via taskIds →
// Task.parentTaskId) and have no parent themselves.
const CreatePhaseSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  checklist: z.array(z.string()).optional(),
  taskIds: z.array(z.string("Invalid taskId")).optional(),
  ...taskLinkFields,
  documents: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z.number(),
        buffer: z.custom<Buffer>((data) => data instanceof Buffer, {
          message: "Buffer is required",
        }),
      }),
    )
    .optional(),
}).meta({ id: "POST /api/company/{companyId}/projects/{projectId}/phases", route: "POST /api/company/{companyId}/projects/{projectId}/phases" });

export const createPhase = async (props: any) => {
  try {
    CreatePhaseSchema.parse(props);

    const { userId, companyId, projectId, taskIds, documents: _docs, ...rest } =
      props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_tasks",
      action: "create",
    });
    if (props.documents?.length) {
      await assertCompanyPermission({
        userId,
        companyId,
        key: "task_documents",
        action: "create",
      });
    }

    if (!(await isProjectInCompany({ projectId, companyId }))) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    await validateCompanyMembers({ companyId, userIds: props.userIds });
    await validateCompanyTeams({ companyId, teamIds: props.teamIds });
    await validateProjectTaskLinks({
      projectId,
      childTaskIds: taskIds,
      sequences: props.sequences,
      relationships: props.relationships,
    });

    const taskId = uuid();
    let documents = undefined;
    if (props.documents?.length) {
      documents = await fileService.uploadTaskDocuments({
        files: props.documents,
        taskId,
      });
    }

    const phase = await insertProjectTask({
      ...rest,
      userId,
      companyId,
      projectId,
      type: "phase",
      childTaskIds: taskIds,
      documents,
      taskId,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Phase created",
      phase,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error creating this phase"],
    } = caught;
    throw { status, error };
  }
};

const UpdatePhaseSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  phaseId: z.string("Invalid phaseId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  taskIds: z.array(z.string("Invalid taskId")).optional(),
  ...taskLinkFields,
}).meta({ id: "PUT /api/company/{companyId}/projects/{projectId}/phases/{phaseId}", route: "PUT /api/company/{companyId}/projects/{projectId}/phases/{phaseId}" });

export const updatePhase = async (props: any) => {
  try {
    UpdatePhaseSchema.parse(props);

    const { userId, companyId, projectId, phaseId, taskIds, ...rest } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: phaseId,
      action: "update",
    });

    await validateCompanyMembers({ companyId, userIds: props.userIds });
    await validateCompanyTeams({ companyId, teamIds: props.teamIds });
    await validateProjectTaskLinks({
      projectId,
      childTaskIds: taskIds,
      sequences: props.sequences,
      relationships: props.relationships,
    });

    const phase = await updateProjectTaskQuery({
      ...rest,
      userId,
      companyId,
      projectId,
      taskId: phaseId,
      typeFilter: "phase",
      childTaskIds: taskIds,
    });

    if (!phase) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Phase not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Phase updated",
      phase,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error updating this phase"],
    } = caught;
    throw { status, error };
  }
};

export const getPhase = async (props: {
  userId: string;
  companyId: string;
  projectId: string;
  phaseId: string;
}) => {
  try {
    const { userId, companyId, projectId, phaseId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: phaseId,
      action: "read",
    });

    const phase = await selectProjectTask({
      userId,
      companyId,
      projectId,
      taskId: phaseId,
      type: "phase",
    });

    if (!phase) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Phase not found"],
      };
    }

    const [users, teams, graph] = await Promise.all([
      selectUsersForTask({ taskId: phaseId, companyId }),
      selectTeamsForTask({ taskId: phaseId }),
      selectTaskGraph({ taskId: phaseId, parentTaskId: phase.parentTaskId }),
    ]);

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Phase fetched",
      phase: { ...phase, users, teams, ...graph },
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching this phase"],
    } = caught;
    throw { status, error };
  }
};

export const listPhases = async (props: {
  userId: string;
  companyId: string;
  projectId: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const { userId, companyId } = props;

    const { isOwner, permissions } = await resolveCompanyPermissions({
      userId,
      companyId,
    });
    const canAll = isOwner || !!permissions["all_tasks"]?.read;
    const canAssigned = isOwner || !!permissions["assigned_tasks"]?.read;

    if (!canAll && !canAssigned) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["You don't have permission to view these phases"],
      };
    }

    const { tasks, totalItems, totalPages } = await selectProjectTasks({
      ...props,
      assignedOnly: !canAll,
      type: "phase",
    });

    return {
      status: tasks?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Phases fetched",
      phases: tasks,
      totalItems,
      totalPages,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching these phases"],
    } = caught;
    throw { status, error };
  }
};

export const deletePhase = async (props: {
  userId: string;
  companyId: string;
  projectId: string;
  phaseId: string;
}) => {
  try {
    const { userId, companyId, projectId, phaseId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: phaseId,
      action: "delete",
    });

    const phase = await deleteProjectTaskQuery({
      userId,
      companyId,
      projectId,
      taskId: phaseId,
      type: "phase",
    });

    if (!phase) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Phase not found"],
      };
    }

    return { status: HTTP_STATUSES.SUCCESS.OK, message: "Phase deleted", phase };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error deleting this phase"],
    } = caught;
    throw { status, error };
  }
};
