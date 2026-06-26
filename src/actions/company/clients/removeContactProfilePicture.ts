import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectContact,
  removeContactProfilePicture as removeContactProfilePictureQuery,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const RemoveContactProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  contactId: z.string("Invalid contactId"),
});

export type RemoveContactProfilePictureProps = z.infer<
  typeof RemoveContactProfilePictureSchema
>;

// Clears a contact's profile picture: nulls the FK, soft-deletes the Document,
// and best-effort removes the variants from the bucket.
export const removeContactProfilePicture = async (
  props: RemoveContactProfilePictureProps,
) => {
  try {
    RemoveContactProfilePictureSchema.parse(props);

    const { userId, companyId, clientId, contactId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "update",
    });

    const { exists } = await selectContact({ contactId, clientId, companyId });
    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Contact not found"],
      };
    }

    const { oldBasePath } = await removeContactProfilePictureQuery({
      contactId,
      clientId,
      companyId,
      userId,
    });

    if (oldBasePath) {
      fileService
        .deletePublicImage(oldBasePath)
        .catch((error) =>
          console.log(
            "Failed to delete removed contact profile picture",
            error,
          ),
        );
    }

    const { contact } = await selectContact({ contactId, clientId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Contact profile picture removed",
      contact,
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
      error = ["There was an error removing the contact profile picture"],
    } = caught;

    throw { status, error };
  }
};
