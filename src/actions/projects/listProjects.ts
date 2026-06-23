import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProjects,
  SelectProjectsProps,
} from "../../services/db/index.js";
import * as z from "zod";
import { getBatchLocationData } from "../../services/maps/getBatchProjectLocationData.js";

const ListProjectsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
  page: z.coerce.number("Page must be a number if passed").optional(),
  pageSize: z.coerce.number("pageSize must be a number if passed").optional(),
});

export const listProjects = async (listProjectsProps: SelectProjectsProps) => {
  try {
    ListProjectsSchema.parse(listProjectsProps);

    const { projects, totalItems, totalPages } =
      await selectProjects(listProjectsProps);

    return {
      status: projects?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Projects fetched",
      projects: await getBatchLocationData({ projects }),
      totalItems,
      totalPages,
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
