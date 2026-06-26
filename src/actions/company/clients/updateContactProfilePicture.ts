import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectContact,
  setContactProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const UpdateContactProfilePictureSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  contactId: z.string("Invalid contactId"),
});

export type UpdateContactProfilePictureProps = z.infer<
  typeof UpdateContactProfilePictureSchema
> & {
  file?: Express.Multer.File;
};

// Sets a contact's profile picture: resizes to WebP variants in the public
// bucket, points the contact at the new Document, and best-effort removes the
// variants of the avatar it replaced. Managing a contact requires the client
// update permission.
export const updateContactProfilePicture = async ({
  file,
  ...props
}: UpdateContactProfilePictureProps) => {
  try {
    UpdateContactProfilePictureSchema.parse(props);

    const { userId, companyId, clientId, contactId } = props;

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

    const { exists } = await selectContact({ contactId, clientId, companyId });
    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Contact not found"],
      };
    }

    const upload = await fileService.uploadContactProfilePicture({
      contactId,
      file,
    });

    const { oldBasePath } = await setContactProfilePicture({
      contactId,
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
          console.log("Failed to delete old contact profile picture", error),
        );
    }

    const { contact } = await selectContact({ contactId, clientId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Contact profile picture updated",
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
      error = ["There was an error updating the contact profile picture"],
    } = caught;

    throw { status, error };
  }
};
