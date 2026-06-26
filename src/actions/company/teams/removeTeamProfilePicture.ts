import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectTeam,
  removeTeamProfilePicture as removeTeamProfilePictureQuery,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const RemoveTeamProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  teamId: z.string("Invalid teamId"),
});

export type RemoveTeamProfilePictureProps = z.infer<
  typeof RemoveTeamProfilePictureSchema
>;

// Clears a team's profile picture: nulls the FK, soft-deletes the Document, and
// best-effort removes the variants from the bucket.
export const removeTeamProfilePicture = async (
  props: RemoveTeamProfilePictureProps,
) => {
  try {
    RemoveTeamProfilePictureSchema.parse(props);

    const { userId, companyId, teamId } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "update",
    });

    const { exists } = await selectTeam({ teamId, companyId });
    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Team not found"],
      };
    }

    const { oldBasePath } = await removeTeamProfilePictureQuery({
      teamId,
      companyId,
      userId,
    });

    if (oldBasePath) {
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete removed team profile picture", error),
        );
    }

    const { team } = await selectTeam({ teamId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Team profile picture removed",
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
      error = ["There was an error removing the team profile picture"],
    } = caught;

    throw { status, error };
  }
};
