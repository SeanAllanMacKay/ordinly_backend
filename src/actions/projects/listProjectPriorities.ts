import { HTTP_STATUSES } from "../HTTP_STATUSES";
import {
  selectProjectPriorities,
  SelectProjectPrioritiesProps,
} from "../../services/db";
import * as z from "zod";

const ListProjectsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
});

export const listProjectPriorities = async (
  listProjectPrioritiesProps: SelectProjectPrioritiesProps,
) => {
  try {
    ListProjectsSchema.parse(listProjectPrioritiesProps);

    const projectPriorities = await selectProjectPriorities(
      listProjectPrioritiesProps,
    );

    return {
      status: projectPriorities?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Project prioritiess fetched",
      projectPriorities,
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
      error = ["There was an error fetching your project priorities"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
