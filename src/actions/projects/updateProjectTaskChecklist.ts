import {
  UpdateProjectTaskChecklistProps,
  updateProjectTaskChecklist as updateProjectTaskChecklistQuery,
  isTaskInProjectCompany,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const UpdateProjectTaskChecklistSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string(),
  taskId: z.string(),
  companyId: z.string("Invalid companyId"),
  items: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      isComplete: z.boolean(),
      order: z.number(),
    }),
  ),
}).meta({ id: "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}/checklist", route: "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}/checklist" });

export const updateProjectTaskChecklist = async (
  updateProjectTaskChecklistProps: UpdateProjectTaskChecklistProps,
) => {
  try {
    UpdateProjectTaskChecklistSchema.parse(updateProjectTaskChecklistProps);

    const { userId, companyId, projectId, taskId } =
      updateProjectTaskChecklistProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "checklist",
      assetId: taskId,
      action: "update",
    });

    if (!(await isTaskInProjectCompany({ taskId, projectId, companyId }))) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Task not found"],
      };
    }

    const task = await updateProjectTaskChecklistQuery(
      updateProjectTaskChecklistProps,
    );

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Task checklist updated",
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
      error = ["There was an error updating this task's checklist"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
