import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProjectTask,
  SelectProjectTaskProps,
  selectUsersForTask,
  selectTeamsForTask,
  selectTaskGraph,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { fileService } from "../../services/files/index.js";

const GetProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
  taskId: z.string("Invalid taskId"),
});

export const getProjectTask = async (
  getProjectTaskProps: SelectProjectTaskProps,
) => {
  try {
    GetProjectTaskSchema.parse(getProjectTaskProps);

    const { userId, companyId, taskId } = getProjectTaskProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "task",
      assetId: taskId,
      action: "read",
    });

    const task = await selectProjectTask({ ...getProjectTaskProps, type: "task" });

    if (!task) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Task not found"],
      };
    }

    const [documents, users, teams, graph] = await Promise.all([
      fileService.appendExternalURLsToObjectsInArray({
        documents: task.documents,
      }),
      selectUsersForTask({ taskId, companyId }),
      selectTeamsForTask({ taskId }),
      selectTaskGraph({ taskId, parentTaskId: task.parentTaskId }),
    ]);

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Task fetched",
      task: { ...task, documents, users, teams, ...graph },
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
      error = ["There was an error fetching this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
