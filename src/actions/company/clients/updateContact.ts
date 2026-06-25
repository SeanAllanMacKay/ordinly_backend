import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  updateContact as updateContactQuery,
  getAccessibleProjectIds,
} from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";
import { contactInfoFields } from "./schemas.js";

const UpdateContactSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  contactId: z.string("Invalid contactId"),
  name: z.string("Name must be a string if passed").optional(),
  role: z.string("Role must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  ...contactInfoFields,
}).meta({
  id: "PUT /api/company/{companyId}/clients/{clientId}/contacts/{contactId}",
  route: "PUT /api/company/{companyId}/clients/{clientId}/contacts/{contactId}",
});

export type UpdateContactProps = z.infer<typeof UpdateContactSchema>;

// Updates a contact and, when provided, reconciles its contact info.
export const updateContact = async (props: UpdateContactProps) => {
  try {
    UpdateContactSchema.parse(props);

    const { userId, companyId, clientId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "update",
    });

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

    const contact = await updateContactQuery({ ...props, projectAccess });

    if (!contact) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Contact not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Contact updated",
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
      error = ["There was an error updating the contact"],
    } = caught;

    throw { status, error };
  }
};
