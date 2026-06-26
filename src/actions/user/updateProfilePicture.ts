import type { APIResponse } from "../../routers/types.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectUserById,
  setUserProfilePicture,
} from "../../services/db/index.js";
import { fileService } from "../../services/files/index.js";

export type UpdateProfilePictureProps = {
  userId: string;
  file?: Express.Multer.File;
};

type UpdateProfilePicturePayload = {
  user: Awaited<ReturnType<typeof selectUserById>>;
};

/**
 * Sets the authenticated user's profile picture: resizes to WebP variants in the
 * public bucket, points the user at the new Document, and best-effort removes the
 * variants of the avatar it replaced.
 */
export const updateProfilePicture = async ({
  userId,
  file,
}: UpdateProfilePictureProps): APIResponse<UpdateProfilePicturePayload> => {
  try {
    if (!file) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["A profile picture file is required"],
      };
    }

    const upload = await fileService.uploadUserProfilePicture({ userId, file });

    const { oldBasePath } = await setUserProfilePicture({ userId, upload });

    if (oldBasePath) {
      // Best-effort: a stale orphan in the bucket shouldn't fail the request.
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete old profile picture", error),
        );
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Profile picture updated",
      user: await selectUserById({ userId }),
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error updating your profile picture"],
    } = caught;

    throw { status, error };
  }
};
