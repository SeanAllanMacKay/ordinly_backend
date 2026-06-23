import {
  updateProjectTask as updateProjectTaskQuery,
  UpdateProjectTaskProps,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const UpdateProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  taskId: z.string(),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
}).meta({ id: "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}", route: "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}" });

export const updateProjectTask = async (
  updateProjectProps: UpdateProjectTaskProps,
) => {
  try {
    UpdateProjectTaskSchema.parse(updateProjectProps);

    const { userId, companyId, taskId } = updateProjectProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: taskId,
      action: "update",
    });

    const task = await updateProjectTaskQuery(updateProjectProps);

    if (!task) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Task not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Task updated",
      task,
    };
  } catch (caught: any) {
    console.log(caught);
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error updating this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
