import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { deleteTeam as deleteTeamQuery } from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const DeleteTeamSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  teamId: z.string("Invalid teamId"),
});

export type DeleteTeamProps = z.infer<typeof DeleteTeamSchema>;

// Soft-deletes a team and its memberships.
export const deleteTeam = async (props: DeleteTeamProps) => {
  try {
    DeleteTeamSchema.parse(props);

    const { userId, companyId, teamId } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "delete",
    });

    const team = await deleteTeamQuery({ teamId, companyId, userId });

    if (!team) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Team not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Team deleted",
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
      error = ["There was an error deleting the team"],
    } = caught;

    throw { status, error };
  }
};
