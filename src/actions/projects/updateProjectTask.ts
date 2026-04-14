import {
  updateProjectTask as updateProjectTaskQuery,
  UpdateProjectTaskProps,
} from "../../services/db/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const UpdateProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  taskId: z.string(),
  companyId: z.string().optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateProjectTask = async (
  updateProjectProps: UpdateProjectTaskProps,
) => {
  try {
    UpdateProjectTaskSchema.parse(updateProjectProps);

    const task = await updateProjectTaskQuery(updateProjectProps);

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
