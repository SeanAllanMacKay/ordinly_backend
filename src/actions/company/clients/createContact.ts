import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertContact,
  selectClient,
  getAccessibleProjectIds,
} from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
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

export type CreateContactProps = z.infer<typeof CreateContactSchema>;

// Adds a contact to a client. Managing a client's contacts requires the client
// update permission.
export const createContact = async (props: CreateContactProps) => {
  try {
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

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Contact created",
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
      error = ["There was an error creating the contact"],
    } = caught;

    throw { status, error };
  }
};
