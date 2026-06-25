import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProjectOptions,
  resolveCompanyPermissions,
} from "../../services/db/index.js";
import * as z from "zod";

const ListProjectOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  search: z.string().optional(),
}).meta({
  id: "GET /api/company/{companyId}/projects/options",
  route: "GET /api/company/{companyId}/projects/options",
});

export type ListProjectOptionsProps = z.infer<typeof ListProjectOptionsSchema>;

// Slimmed-down { value, label } project list for FE selects. Reuses the projects
// read scope: all_projects.read → every project; assigned_projects.read → assigned only.
export const listProjectOptions = async (props: ListProjectOptionsProps) => {
  try {
    ListProjectOptionsSchema.parse(props);

    const { userId, companyId, search } = props;

    const { isOwner, permissions } = await resolveCompanyPermissions({
      userId,
      companyId,
    });
    const canAll = isOwner || !!permissions["all_projects"]?.read;
    const canAssigned = isOwner || !!permissions["assigned_projects"]?.read;

    if (!canAll && !canAssigned) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["You don't have permission to view these projects"],
      };
    }

    const options = await selectProjectOptions({
      userId,
      companyId,
      assignedOnly: !canAll,
      search,
    });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Project options fetched",
      options,
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
      error = ["There was an error fetching the project options"],
    } = caught;

    throw { status, error };
  }
};
