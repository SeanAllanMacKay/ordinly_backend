import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  updateClient as updateClientQuery,
  getAccessibleProjectIds,
} from "../../../services/db/index.js";
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
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  ...contactInfoFields,
}).meta({
  id: "PUT /api/company/{companyId}/clients/{clientId}",
  route: "PUT /api/company/{companyId}/clients/{clientId}",
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

    const client = await updateClientQuery({ ...props, projectAccess });

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
