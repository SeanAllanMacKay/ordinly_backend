import { HTTP_STATUSES } from "../HTTP_STATUSES";
import { selectProject, SelectProjectProps } from "../../services/db";
import * as z from "zod";

const GetProjectsSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId").optional(),
});

export const getProject = async (getProjectProps: SelectProjectProps) => {
  try {
    GetProjectsSchema.parse(getProjectProps);

    const project = await selectProject(getProjectProps);

    if (!project) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Project fetched",
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
      error = ["There was an error fetching your projects"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
