import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  deleteCompanyRole as deleteCompanyRoleQuery,
  selectRoleCompany,
} from "../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../permissions/index.js";
import * as z from "zod";

const DeleteCompanyRoleSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  roleId: z.string("Invalid roleId"),
});

export type DeleteCompanyRoleProps = z.infer<typeof DeleteCompanyRoleSchema>;

// Soft-deletes a company-specific role. System roles (null companyId) are
// shared templates and can't be deleted.
export const deleteCompanyRole = async (props: DeleteCompanyRoleProps) => {
  try {
    DeleteCompanyRoleSchema.parse(props);

    const { userId, companyId, roleId } = props;

    const role = await selectRoleCompany({ roleId, scope: "company" });

    if (!role.exists || role.companyId !== companyId) {
      // Either it doesn't exist, belongs to another company, or is a system
      // role (null companyId) — distinguish the latter for a clearer message.
      if (role.exists && !role.companyId) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
          error: ["System roles can't be deleted"],
        };
      }

      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Role not found"],
      };
    }

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "roles",
      action: "delete",
    });

    const deleted = await deleteCompanyRoleQuery({ roleId, companyId, userId });

    if (!deleted) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Role not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Role deleted",
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
      error = ["There was an error deleting the role"],
    } = caught;

    throw { status, error };
  }
};
