import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectTeam } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const GetTeamSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  teamId: z.string("Invalid teamId"),
});

export type GetTeamProps = z.infer<typeof GetTeamSchema>;

// Fetches a single team (with members) scoped to its company.
export const getTeam = async (props: GetTeamProps) => {
  try {
    GetTeamSchema.parse(props);

    const { userId, companyId, teamId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "read",
    });

    const { exists, team } = await selectTeam({ teamId, companyId });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Team not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Team fetched",
      team,
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
      error = ["There was an error fetching the team"],
    } = caught;

    throw { status, error };
  }
};
