import {
  updateProject as updateProjectQuery,
  UpdateProjectProps,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const UpdateProjectSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        isComplete: z.boolean(),
      }),
    )
    .optional(),
  location: z
    .object({
      name: z.string().optional(),
      type: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
}).meta({ id: "PUT /api/company/{companyId}/projects/{projectId}", route: "PUT /api/company/{companyId}/projects/{projectId}" });

export const updateProject = async (updateProjectProps: UpdateProjectProps) => {
  try {
    UpdateProjectSchema.parse(updateProjectProps);

    const { userId, companyId, projectId } = updateProjectProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "project",
      assetId: projectId,
      action: "update",
    });

    const project = await updateProjectQuery(updateProjectProps);

    if (!project) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Project updated",
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
      error = ["There was an error updating this project"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
