import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertContact,
  selectClient,
  getAccessibleProjectIds,
  setContactProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import { coerceJsonFields } from "../../util/multipart.js";
import * as z from "zod";
import { contactInfoFields } from "./schemas.js";

const CreateContactSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  name: z.string("Name must be a string"),
  role: z.string("Role must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  ...contactInfoFields,
}).meta({
  id: "POST /api/company/{companyId}/clients/{clientId}/contacts",
  route: "POST /api/company/{companyId}/clients/{clientId}/contacts",
});

export type CreateContactProps = z.infer<typeof CreateContactSchema> & {
  // Optional avatar set at creation. Best-effort: an upload failure must not
  // block contact creation.
  profilePicture?: Express.Multer.File;
};

// Adds a contact to a client. Managing a client's contacts requires the client
// update permission.
export const createContact = async ({
  profilePicture,
  ...raw
}: CreateContactProps) => {
  try {
    // Structured fields arrive as JSON strings when the request is multipart
    // (i.e. a profile picture is attached); decode them before validation.
    const props = coerceJsonFields(raw, [
      "projectIds",
      "phoneNumbers",
      "emails",
      "locations",
    ]);

    CreateContactSchema.parse(props);

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

    // Connecting projects additionally requires the project-read tier; we only
    // reconcile within the projects the user can see.
    let projectAccess;
    if (props.projectIds !== undefined) {
      projectAccess = await getAccessibleProjectIds({ userId, companyId });
      if (!projectAccess.canRead) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
          error: ["You don't have permission to connect projects"],
        };
      }
    }

    const contact = await insertContact({ ...props, projectAccess });

    // Optional avatar set at creation. Best-effort: a failure here shouldn't
    // block contact creation.
    let profilePictureURLs = null;
    if (profilePicture) {
      try {
        const upload = await fileService.uploadContactProfilePicture({
          contactId: contact.id,
          file: profilePicture,
        });
        await setContactProfilePicture({
          contactId: contact.id,
          clientId,
          companyId,
          userId,
          upload,
        });
        profilePictureURLs = await fileService.buildContactProfilePictureURLs(
          upload.path,
        );
      } catch (pictureError) {
        console.log("Contact profile picture upload failed", pictureError);
      }
    }

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Contact created",
      contact: { ...contact, profilePicture: profilePictureURLs },
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
      error = ["There was an error creating the contact"],
    } = caught;

    throw { status, error };
  }
};
