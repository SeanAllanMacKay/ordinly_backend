import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectTaskStatuses,
  SelectTaskStatusesProps,
} from "../../services/db/index.js";
import * as z from "zod";

const ListTaskStatusesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
});

export const listTaskStatuses = async (
  listTaskStatusesProps: SelectTaskStatusesProps,
) => {
  try {
    ListTaskStatusesSchema.parse(listTaskStatusesProps);

    const taskStatuses = await selectTaskStatuses(listTaskStatusesProps);

    return {
      status: taskStatuses?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Task statuses fetched",
      taskStatuses,
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
      error = ["There was an error fetching your Task statuses"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
