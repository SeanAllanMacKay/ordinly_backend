import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectClient,
  removeClientProfilePicture as removeClientProfilePictureQuery,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const RemoveClientProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
});

export type RemoveClientProfilePictureProps = z.infer<
  typeof RemoveClientProfilePictureSchema
>;

// Clears a client's profile picture: nulls the FK, soft-deletes the Document, and
// best-effort removes the variants from the bucket.
export const removeClientProfilePicture = async (
  props: RemoveClientProfilePictureProps,
) => {
  try {
    RemoveClientProfilePictureSchema.parse(props);

    const { userId, companyId, clientId } = props;

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

    const { oldBasePath } = await removeClientProfilePictureQuery({
      clientId,
      companyId,
      userId,
    });

    if (oldBasePath) {
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log("Failed to delete removed client profile picture", error),
        );
    }

    const { client } = await selectClient({ clientId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Client profile picture removed",
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
      error = ["There was an error removing the client profile picture"],
    } = caught;

    throw { status, error };
  }
};
