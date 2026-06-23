import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectTeams } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListTeamsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
}).meta({ id: "GET /api/company/{companyId}/teams", route: "GET /api/company/{companyId}/teams" });

export type ListTeamsProps = z.infer<typeof ListTeamsSchema>;

// Lists a company's teams with their members.
export const listTeams = async (props: ListTeamsProps) => {
  try {
    ListTeamsSchema.parse(props);

    const { userId, companyId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "read",
    });

    const teams = await selectTeams({ companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Teams fetched",
      teams,
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
      error = ["There was an error fetching the teams"],
    } = caught;

    throw { status, error };
  }
};
