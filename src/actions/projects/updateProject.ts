import {
  updateProject as updateProjectQuery,
  UpdateProjectProps,
} from "../../services/db";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES";

const UpdateProjectSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  companyId: z.string().optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string(),
  priority: z.string(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
});

export const updateProject = async (updateProjectProps: UpdateProjectProps) => {
  try {
    UpdateProjectSchema.parse(updateProjectProps);

    const project = await updateProjectQuery(updateProjectProps);

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Project updated",
      project,
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
      error = ["There was an error updating this project"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
