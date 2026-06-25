import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectTeamOptions } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListTeamOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  search: z.string().optional(),
}).meta({
  id: "GET /api/company/{companyId}/teams/options",
  route: "GET /api/company/{companyId}/teams/options",
});

export type ListTeamOptionsProps = z.infer<typeof ListTeamOptionsSchema>;

// Slimmed-down { value, label } team list for FE selects, gated by teams:read.
export const listTeamOptions = async (props: ListTeamOptionsProps) => {
  try {
    ListTeamOptionsSchema.parse(props);

    const { userId, companyId, search } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "read",
    });

    const options = await selectTeamOptions({ companyId, search });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Team options fetched",
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
      error = ["There was an error fetching the team options"],
    } = caught;

    throw { status, error };
  }
};
