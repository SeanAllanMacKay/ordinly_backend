import { HTTP_STATUSES } from "../HTTP_STATUSES";

import { InsertTaskProps } from "../../services/db";
import * as z from "zod";
import { insertProjectTask } from "../../services/db/queries/insert/insertProjectTask";

const CreateProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  companyId: z.string("Invalid companyId").optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  checklist: z.array(z.string()).optional(),
});

export const createProjectTask = async (createTaskProps: InsertTaskProps) => {
  try {
    CreateProjectTaskSchema.parse(createTaskProps);

    const newTask = insertProjectTask(createTaskProps);

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Task created",
      task: newTask,
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
