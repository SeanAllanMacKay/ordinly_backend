import type { APIResponse } from "../../routers/types.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  removeUserProfilePicture,
  selectUserById,
} from "../../services/db/index.js";
import { fileService } from "../../services/files/index.js";

export type RemoveProfilePictureProps = {
  userId: string;
};

type RemoveProfilePicturePayload = {
  user: Awaited<ReturnType<typeof selectUserById>>;
};

/**
 * Clears the authenticated user's profile picture: nulls the FK, soft-deletes the
 * Document, and best-effort removes the variants from the bucket.
 */
export const removeProfilePicture = async ({
  userId,
}: RemoveProfilePictureProps): APIResponse<RemoveProfilePicturePayload> => {
  try {
    const { oldBasePath } = await removeUserProfilePicture({ userId });

    if (oldBasePath) {
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete removed profile picture", error),
        );
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Profile picture removed",
      user: await selectUserById({ userId }),
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error removing your profile picture"],
    } = caught;

    throw { status, error };
  }
};
