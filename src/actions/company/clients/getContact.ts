import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectContact } from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const GetContactSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  contactId: z.string("Invalid contactId"),
});

export type GetContactProps = z.infer<typeof GetContactSchema>;

// Fetches a single contact (with its contact info) scoped to its client.
export const getContact = async (props: GetContactProps) => {
  try {
    GetContactSchema.parse(props);

    const { userId, companyId, clientId, contactId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "read",
    });

    const { exists, contact } = await selectContact({
      contactId,
      clientId,
      companyId,
    });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Contact not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Contact fetched",
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
      error = ["There was an error fetching the contact"],
    } = caught;

    throw { status, error };
  }
};
