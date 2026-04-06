import { HTTP_STATUSES } from "../HTTP_STATUSES";
import {
  selectTaskPriorities,
  SelectTaskPrioritiesProps,
} from "../../services/db";
import * as z from "zod";

const ListTaskPrioritiesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
});

export const listTaskPriorities = async (
  listTaskPrioritiesProps: SelectTaskPrioritiesProps,
) => {
  try {
    ListTaskPrioritiesSchema.parse(listTaskPrioritiesProps);

    const taskPriorities = await selectTaskPriorities(listTaskPrioritiesProps);

    return {
      status: taskPriorities?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Task priorities fetched",
      taskPriorities,
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
      error = ["There was an error fetching your task priorities"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
