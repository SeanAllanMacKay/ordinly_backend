import { HTTP_STATUSES } from "../../HTTP_STATUSES";
import { Project } from "../../../services/database";
import { APIResponse } from "../../../routers/types";
import { ProjectType } from "../../../services/database/types";

type GetPersonalProject = {
  projectId: string;
  userId: string;
};

export const getPersonalProject = async ({
  projectId,
  userId,
}: GetPersonalProject): APIResponse<{ project: ProjectType }> => {
  try {
    const project = await Project.findOne({
      _id: projectId,
      "owner.id": userId,
    }).lean();

    if (!project) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: "Project not found",
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Project found",
      project,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching this project",
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
