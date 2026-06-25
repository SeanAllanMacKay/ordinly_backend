import {
  deleteProjectTask as deleteProjectTaskQuery,
  DeleteProjectTaskProps,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const DeleteProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  taskId: z.string(),
  companyId: z.string("Invalid companyId"),
});

export const deleteProjectTask = async (
  deleteProjectTaskProps: DeleteProjectTaskProps,
) => {
  try {
    DeleteProjectTaskSchema.parse(deleteProjectTaskProps);

    const { userId, companyId, taskId } = deleteProjectTaskProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: taskId,
      action: "delete",
    });

    const task = await deleteProjectTaskQuery({
      ...deleteProjectTaskProps,
      type: "task",
    });

    if (!task) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Task not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Task deleted",
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
      error = ["There was an error deleting this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
