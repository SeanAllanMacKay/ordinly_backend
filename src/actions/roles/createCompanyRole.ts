import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { insertCompanyRole } from "../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../permissions/index.js";
import * as z from "zod";

const CreateCompanyRoleSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
}).meta({ id: "POST /api/company/{companyId}/roles", route: "POST /api/company/{companyId}/roles" });

export type CreateCompanyRoleProps = z.infer<typeof CreateCompanyRoleSchema>;

// Creates a company-specific role. Permissions are assigned afterwards via the
// PUT :roleId/permissions endpoint.
export const createCompanyRole = async (props: CreateCompanyRoleProps) => {
  try {
    CreateCompanyRoleSchema.parse(props);

    const { userId, companyId, name, description } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "roles",
      action: "create",
    });

    const role = await insertCompanyRole({
      companyId,
      userId,
      name,
      description,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Role created",
      role,
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
      error = ["There was an error creating the role"],
    } = caught;

    throw { status, error };
  }
};
