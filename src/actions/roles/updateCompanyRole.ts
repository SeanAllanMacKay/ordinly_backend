import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { updateCompanyRole as updateCompanyRoleQuery } from "../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../permissions/index.js";
import * as z from "zod";

const UpdateCompanyRoleSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  roleId: z.string("Invalid roleId"),
  name: z.string("Name must be a string").optional(),
  description: z.string("Description must be a string if passed").optional(),
}).meta({ id: "PUT /api/company/{companyId}/roles/{roleId}", route: "PUT /api/company/{companyId}/roles/{roleId}" });

export type UpdateCompanyRoleProps = z.infer<typeof UpdateCompanyRoleSchema>;

// Updates a company role's name/description. System roles can't be edited here
// (the query is scoped by companyId, so they never match).
export const updateCompanyRole = async (props: UpdateCompanyRoleProps) => {
  try {
    UpdateCompanyRoleSchema.parse(props);

    const { userId, companyId, roleId, name, description } = props;

    if (name === undefined && description === undefined) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["Nothing to update"],
      };
    }

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "roles",
      action: "update",
    });

    const role = await updateCompanyRoleQuery({
      roleId,
      companyId,
      name,
      description,
    });

    if (!role) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Role not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Role updated",
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
      error = ["There was an error updating the role"],
    } = caught;

    throw { status, error };
  }
};
