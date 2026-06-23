import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectContacts, selectClient } from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListContactsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
});

export type ListContactsProps = z.infer<typeof ListContactsSchema>;

// Lists a client's contacts, each with their contact info.
export const listContacts = async (props: ListContactsProps) => {
  try {
    ListContactsSchema.parse(props);

    const { userId, companyId, clientId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "read",
    });

    const { exists } = await selectClient({ clientId, companyId });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Client not found"],
      };
    }

    const contacts = await selectContacts({ clientId, companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Contacts fetched",
      contacts,
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
      error = ["There was an error fetching the contacts"],
    } = caught;

    throw { status, error };
  }
};
