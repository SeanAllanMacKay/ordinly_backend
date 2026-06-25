import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectTaskOptions,
  resolveCompanyPermissions,
} from "../../services/db/index.js";
import { taskType } from "../../services/db/constants.js";
import * as z from "zod";

type TaskTypeValue = (typeof taskType)[number];

const TaskTypeOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  search: z.string().optional(),
});

export type ListTaskTypeOptionsProps = z.infer<typeof TaskTypeOptionsSchema>;

// Shared core for the task/phase/milestone options endpoints — all three are Task
// rows differing only by `type`. Reuses the task read scope: all_tasks.read → every
// row; assigned_tasks.read → only the user's assigned rows.
const resolveTaskTypeOptions = async (
  props: ListTaskTypeOptionsProps,
  type: TaskTypeValue,
  label: string,
) => {
  try {
    TaskTypeOptionsSchema.parse(props);

    const { userId, companyId, projectId, search } = props;

    const { isOwner, permissions } = await resolveCompanyPermissions({
      userId,
      companyId,
    });
    const canAll = isOwner || !!permissions["all_tasks"]?.read;
    const canAssigned = isOwner || !!permissions["assigned_tasks"]?.read;

    if (!canAll && !canAssigned) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: [`You don't have permission to view these ${label}`],
      };
    }

    const options = await selectTaskOptions({
      userId,
      companyId,
      projectId,
      type,
      assignedOnly: !canAll,
      search,
    });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: `${label[0].toUpperCase()}${label.slice(1)} options fetched`,
      options,
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
      error = [`There was an error fetching the ${label} options`],
    } = caught;

    throw { status, error };
  }
};

// Slimmed-down { value, label } lists for FE selects, one per Task row type.
export const listTaskOptions = (props: ListTaskTypeOptionsProps) =>
  resolveTaskTypeOptions(props, "task", "tasks");

export const listPhaseOptions = (props: ListTaskTypeOptionsProps) =>
  resolveTaskTypeOptions(props, "phase", "phases");

export const listMilestoneOptions = (props: ListTaskTypeOptionsProps) =>
  resolveTaskTypeOptions(props, "milestone", "milestones");
