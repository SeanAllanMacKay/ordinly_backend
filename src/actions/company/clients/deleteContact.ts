import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { deleteContact as deleteContactQuery } from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const DeleteContactSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  contactId: z.string("Invalid contactId"),
});

export type DeleteContactProps = z.infer<typeof DeleteContactSchema>;

// Soft-deletes a contact and its contact info. Managing a client's contacts
// requires the client update permission.
export const deleteContact = async (props: DeleteContactProps) => {
  try {
    DeleteContactSchema.parse(props);

    const { userId, companyId, clientId, contactId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "update",
    });

    const contact = await deleteContactQuery({
      contactId,
      clientId,
      companyId,
      userId,
    });

    if (!contact) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Contact not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Contact deleted",
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
      error = ["There was an error deleting the contact"],
    } = caught;

    throw { status, error };
  }
};
