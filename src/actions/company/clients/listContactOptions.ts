import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectContactOptions,
  selectClient,
} from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListContactOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  search: z.string().optional(),
}).meta({
  id: "GET /api/company/{companyId}/clients/{clientId}/contacts/options",
  route: "GET /api/company/{companyId}/clients/{clientId}/contacts/options",
});

export type ListContactOptionsProps = z.infer<typeof ListContactOptionsSchema>;

// Slimmed-down { value, label } contact list for FE selects, gated by the caller's
// read access to the parent client (asset-scoped, like listContacts).
export const listContactOptions = async (props: ListContactOptionsProps) => {
  try {
    ListContactOptionsSchema.parse(props);

    const { userId, companyId, clientId, search } = props;

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

    const options = await selectContactOptions({ companyId, clientId, search });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Contact options fetched",
      options,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching the contact options"],
    } = caught;

    throw { status, error };
  }
};
