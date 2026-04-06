import { HTTP_STATUSES } from "../HTTP_STATUSES";

import { insertProject, InsertProjectProps } from "../../services/db";
import * as z from "zod";

const CreateProjectSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string().optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const createProject = async (createProjectProps: InsertProjectProps) => {
  try {
    CreateProjectSchema.parse(createProjectProps);

    const newProject = await insertProject(createProjectProps);

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Project created",
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
      error = ["There was an error creating this project"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
