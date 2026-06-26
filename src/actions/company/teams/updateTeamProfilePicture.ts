import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectTeam,
  setTeamProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const UpdateTeamProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  teamId: z.string("Invalid teamId"),
});

export type UpdateTeamProfilePictureProps = z.infer<
  typeof UpdateTeamProfilePictureSchema
> & {
  file?: Express.Multer.File;
};

// Sets a team's profile picture: resizes to WebP variants in the public bucket,
// points the team at the new Document, and best-effort removes the variants of
// the avatar it replaced.
export const updateTeamProfilePicture = async ({
  file,
  ...props
}: UpdateTeamProfilePictureProps) => {
  try {
    UpdateTeamProfilePictureSchema.parse(props);

    const { userId, companyId, teamId } = props;

    if (!file) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["A profile picture file is required"],
      };
    }

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

    const upload = await fileService.uploadTeamProfilePicture({ teamId, file });

    const { oldBasePath } = await setTeamProfilePicture({
      teamId,
      companyId,
      userId,
      upload,
    });

    if (oldBasePath) {
      // Best-effort: a stale orphan in the bucket shouldn't fail the request.
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete old team profile picture", error),
        );
    }

    const { team } = await selectTeam({ teamId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Team profile picture updated",
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
      error = ["There was an error updating the team profile picture"],
    } = caught;

    throw { status, error };
  }
};
