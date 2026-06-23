import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProjectTasks,
  SelectProjectTasksProps,
  resolveCompanyPermissions,
} from "../../services/db/index.js";
import * as z from "zod";

const ListProjectTasksSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  page: z.number("Invalid page").optional(),
  pageSize: z.number("Invalid pageSize").optional(),
});

export const listProjectTasks = async (
  listProjectStatusesProps: SelectProjectTasksProps,
) => {
  try {
    ListProjectTasksSchema.parse(listProjectStatusesProps);

    const { userId, companyId } = listProjectStatusesProps;

    // Resolve read scope: all_tasks.read → every project task;
    // assigned_tasks.read → only the user's assigned tasks.
    const { isOwner, permissions } = await resolveCompanyPermissions({
      userId,
      companyId,
    });
    const canAll = isOwner || !!permissions["all_tasks"]?.read;
    const canAssigned = isOwner || !!permissions["assigned_tasks"]?.read;

    if (!canAll && !canAssigned) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["You don't have permission to view these tasks"],
      };
    }

    const { tasks, totalItems, totalPages } = await selectProjectTasks({
      ...listProjectStatusesProps,
      assignedOnly: !canAll,
    });

    return {
      status: tasks?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Project tasks fetched",
      tasks,
      totalItems,
      totalPages,
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
      error = ["There was an error fetching this project's tasks"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
