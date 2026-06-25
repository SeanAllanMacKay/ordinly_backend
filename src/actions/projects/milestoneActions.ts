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
import * as z from "zod";

// A milestone is a Task with type='milestone'. Milestones may hang off a parent
// phase (phaseId → Task.parentTaskId) and carry approver / payment-trigger flags.
// They have no checklist or documents.
const milestoneFields = {
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  approver: z.string("Invalid approver").optional(),
  isPaymentTrigger: z.boolean().optional(),
  phaseId: z.string("Invalid phaseId").nullable().optional(),
  ...taskLinkFields,
};

const CreateMilestoneSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  ...milestoneFields,
}).meta({ id: "POST /api/company/{companyId}/projects/{projectId}/milestones", route: "POST /api/company/{companyId}/projects/{projectId}/milestones" });

export const createMilestone = async (props: any) => {
  try {
    CreateMilestoneSchema.parse(props);

    const { userId, companyId, projectId, phaseId, approver, ...rest } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_tasks",
      action: "create",
    });

    if (!(await isProjectInCompany({ projectId, companyId }))) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    await validateCompanyMembers({
      companyId,
      userIds: [...(props.userIds ?? []), ...(approver ? [approver] : [])],
    });
    await validateCompanyTeams({ companyId, teamIds: props.teamIds });
    await validateProjectTaskLinks({
      projectId,
      phaseId,
      sequences: props.sequences,
      relationships: props.relationships,
    });

    const milestone = await insertProjectTask({
      ...rest,
      userId,
      companyId,
      projectId,
      type: "milestone",
      approver,
      parentTaskId: phaseId ?? undefined,
      checklist: [],
      taskId: uuid(),
    });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Milestone created",
      milestone,
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
      error = ["There was an error creating this milestone"],
    } = caught;
    throw { status, error };
  }
};

const UpdateMilestoneSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  milestoneId: z.string("Invalid milestoneId"),
  ...milestoneFields,
}).meta({ id: "PUT /api/company/{companyId}/projects/{projectId}/milestones/{milestoneId}", route: "PUT /api/company/{companyId}/projects/{projectId}/milestones/{milestoneId}" });

export const updateMilestone = async (props: any) => {
  try {
    UpdateMilestoneSchema.parse(props);

    const { userId, companyId, projectId, milestoneId, phaseId, approver, ...rest } =
      props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: milestoneId,
      action: "update",
    });

    await validateCompanyMembers({
      companyId,
      userIds: [...(props.userIds ?? []), ...(approver ? [approver] : [])],
    });
    await validateCompanyTeams({ companyId, teamIds: props.teamIds });
    await validateProjectTaskLinks({
      projectId,
      phaseId,
      sequences: props.sequences,
      relationships: props.relationships,
    });

    const milestone = await updateProjectTaskQuery({
      ...rest,
      userId,
      companyId,
      projectId,
      taskId: milestoneId,
      typeFilter: "milestone",
      approver,
      parentTaskId: phaseId === undefined ? undefined : phaseId,
    });

    if (!milestone) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Milestone not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Milestone updated",
      milestone,
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
      error = ["There was an error updating this milestone"],
    } = caught;
    throw { status, error };
  }
};

export const getMilestone = async (props: {
  userId: string;
  companyId: string;
  projectId: string;
  milestoneId: string;
}) => {
  try {
    const { userId, companyId, projectId, milestoneId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: milestoneId,
      action: "read",
    });

    const milestone = await selectProjectTask({
      userId,
      companyId,
      projectId,
      taskId: milestoneId,
      type: "milestone",
    });

    if (!milestone) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Milestone not found"],
      };
    }

    const [users, teams, graph] = await Promise.all([
      selectUsersForTask({ taskId: milestoneId, companyId }),
      selectTeamsForTask({ taskId: milestoneId }),
      selectTaskGraph({ taskId: milestoneId, parentTaskId: milestone.parentTaskId }),
    ]);

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Milestone fetched",
      milestone: { ...milestone, users, teams, ...graph },
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching this milestone"],
    } = caught;
    throw { status, error };
  }
};

export const listMilestones = async (props: {
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
        error: ["You don't have permission to view these milestones"],
      };
    }

    const { tasks, totalItems, totalPages } = await selectProjectTasks({
      ...props,
      assignedOnly: !canAll,
      type: "milestone",
    });

    return {
      status: tasks?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Milestones fetched",
      milestones: tasks,
      totalItems,
      totalPages,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching these milestones"],
    } = caught;
    throw { status, error };
  }
};

export const deleteMilestone = async (props: {
  userId: string;
  companyId: string;
  projectId: string;
  milestoneId: string;
}) => {
  try {
    const { userId, companyId, projectId, milestoneId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: milestoneId,
      action: "delete",
    });

    const milestone = await deleteProjectTaskQuery({
      userId,
      companyId,
      projectId,
      taskId: milestoneId,
      type: "milestone",
    });

    if (!milestone) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Milestone not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Milestone deleted",
      milestone,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error deleting this milestone"],
    } = caught;
    throw { status, error };
  }
};
