import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectClient,
  setClientProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const UpdateClientProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
});

export type UpdateClientProfilePictureProps = z.infer<
  typeof UpdateClientProfilePictureSchema
> & {
  file?: Express.Multer.File;
};

// Sets a client's profile picture: resizes to WebP variants in the public
// bucket, points the client at the new Document, and best-effort removes the
// variants of the avatar it replaced.
export const updateClientProfilePicture = async ({
  file,
  ...props
}: UpdateClientProfilePictureProps) => {
  try {
    UpdateClientProfilePictureSchema.parse(props);

    const { userId, companyId, clientId } = props;

    if (!file) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["A profile picture file is required"],
      };
    }

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "update",
    });

    const { exists } = await selectClient({ clientId, companyId });
    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Client not found"],
      };
    }

    const upload = await fileService.uploadClientProfilePicture({
      clientId,
      file,
    });

    const { oldBasePath } = await setClientProfilePicture({
      clientId,
      companyId,
      userId,
      upload,
    });

    if (oldBasePath) {
      // Best-effort: a stale orphan in the bucket shouldn't fail the request.
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete old client profile picture", error),
        );
    }

    const { client } = await selectClient({ clientId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Client profile picture updated",
      client,
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
      error = ["There was an error updating the client profile picture"],
    } = caught;

    throw { status, error };
  }
};
