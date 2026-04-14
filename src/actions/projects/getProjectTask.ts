import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProject,
  selectProjectTask,
  SelectProjectTaskProps,
} from "../../services/db/index.js";
import * as z from "zod";

const GetProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  taskId: z.string("Invalid taskId"),
});

export const getProjectTask = async (
  getProjectTaskProps: SelectProjectTaskProps,
) => {
  try {
    GetProjectTaskSchema.parse(getProjectTaskProps);

    const task = await selectProjectTask(getProjectTaskProps);

    if (!task) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Task not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Task fetched",
      task,
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
      error = ["There was an error fetching this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
