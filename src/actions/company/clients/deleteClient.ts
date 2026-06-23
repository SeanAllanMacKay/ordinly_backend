import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { deleteClient as deleteClientQuery } from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";

const DeleteClientSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
});

export type DeleteClientProps = z.infer<typeof DeleteClientSchema>;

// Soft-deletes a client and cascades to its contacts and contact info.
export const deleteClient = async (props: DeleteClientProps) => {
  try {
    DeleteClientSchema.parse(props);

    const { userId, companyId, clientId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "delete",
    });

    const client = await deleteClientQuery({ clientId, companyId, userId });

    if (!client) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Client not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Client deleted",
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
      error = ["There was an error deleting the client"],
    } = caught;

    throw { status, error };
  }
};
