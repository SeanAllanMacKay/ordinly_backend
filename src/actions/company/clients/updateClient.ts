import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { updateClient as updateClientQuery } from "../../../services/db/index.js";
import { assertCompanyAssetPermission } from "../../permissions/index.js";
import * as z from "zod";
import { contactInfoFields } from "./schemas.js";

const UpdateClientSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  clientId: z.string("Invalid clientId"),
  name: z.string("Name must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
  clientCompanyId: z.string("Invalid clientCompanyId").optional(),
  clientUserId: z.string("Invalid clientUserId").optional(),
  ...contactInfoFields,
});

export type UpdateClientProps = z.infer<typeof UpdateClientSchema>;

// Updates a client's fields and, when provided, reconciles its contact info.
export const updateClient = async (props: UpdateClientProps) => {
  try {
    UpdateClientSchema.parse(props);

    const { userId, companyId, clientId } = props;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "client",
      assetId: clientId,
      action: "update",
    });

    const client = await updateClientQuery(props);

    if (!client) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Client not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Client updated",
      client,
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
      error = ["There was an error updating the client"],
    } = caught;

    throw { status, error };
  }
};
