import {
  deleteProject as deleteProjectQuery,
  DeleteProjectProps,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const DeleteProjectSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  companyId: z.string("Invalid companyId"),
});

export const deleteProject = async (deleteProjectProps: DeleteProjectProps) => {
  try {
    DeleteProjectSchema.parse(deleteProjectProps);

    const { userId, companyId, projectId } = deleteProjectProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "project",
      assetId: projectId,
      action: "delete",
    });

    const project = await deleteProjectQuery(deleteProjectProps);

    if (!project) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Project deleted",
      project,
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
      error = ["There was an error deleting this project"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
