import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertClient,
  getAccessibleProjectIds,
} from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";
import { NestedContactSchema, contactInfoFields } from "./schemas.js";

const CreateClientSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  clientCompanyId: z.string("Invalid clientCompanyId").optional(),
  clientUserId: z.string("Invalid clientUserId").optional(),
  contacts: z.array(NestedContactSchema).optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  ...contactInfoFields,
}).meta({
  id: "POST /api/company/{companyId}/clients",
  route: "POST /api/company/{companyId}/clients",
});

export type CreateClientProps = z.infer<typeof CreateClientSchema>;

// Creates a client with its contact info and any nested contacts. Requires the
// all_clients create permission (you can't be "assigned" to a new client).
export const createClient = async (props: CreateClientProps) => {
  try {
    CreateClientSchema.parse(props);

    const { userId, companyId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_clients",
      action: "create",
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

    const client = await insertClient({ ...props, projectAccess });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Client created",
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
      error = ["There was an error creating the client"],
    } = caught;

    throw { status, error };
  }
};
