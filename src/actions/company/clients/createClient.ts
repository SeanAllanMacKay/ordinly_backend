import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { insertClient } from "../../../services/db/index.js";
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
  ...contactInfoFields,
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

    const client = await insertClient(props);

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
