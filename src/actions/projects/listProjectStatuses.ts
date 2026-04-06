import { HTTP_STATUSES } from "../HTTP_STATUSES";
import {
  selectProjectStatuses,
  SelectProjectStatusesProps,
} from "../../services/db";
import * as z from "zod";

const ListProjectStatusesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
});

export const listProjectStatuses = async (
  listProjectStatusesProps: SelectProjectStatusesProps,
) => {
  try {
    ListProjectStatusesSchema.parse(listProjectStatusesProps);

    const projectStatuses = await selectProjectStatuses(
      listProjectStatusesProps,
    );

    return {
      status: projectStatuses?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Project statuses fetched",
      projectStatuses,
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
      error = ["There was an error fetching your project statuses"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
