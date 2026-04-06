import { HTTP_STATUSES } from "../HTTP_STATUSES";

import { insertTask, InsertTaskProps } from "../../services/db";
import * as z from "zod";

const CreateTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  companyId: z.string("Invalid companyId").optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string(),
  priority: z.string(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
});

export const createTask = async (createTaskProps: InsertTaskProps) => {
  try {
    CreateTaskSchema.parse(createTaskProps);

    const newProject = insertTask(createTaskProps);

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Task created",
      project: newProject,
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
      error = ["There was an error creating this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
