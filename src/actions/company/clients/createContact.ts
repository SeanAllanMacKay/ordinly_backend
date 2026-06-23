import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { insertContact, selectClient } from "../../../services/db/index.js";
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
  ...contactInfoFields,
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

    const contact = await insertContact(props);

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
