import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import {
  upsertRolePermissions,
  selectRoleCompany,
} from "../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../permissions/index.js";
import * as z from "zod";

const UpdateRolePermissionsSchema = z.object({
  userId: z.string("Invalid userId"),
  roleId: z.string("Invalid roleId"),
  scope: z.enum(["company", "project"], "Invalid scope"),
  permissions: z.array(
    z.object({
      permissionId: z.string("Invalid permissionId"),
      levelId: z.string("Invalid levelId"),
    }),
  ),
}).meta({ id: "PUT /api/company/{companyId}/roles/{roleId}/permissions", route: "PUT /api/company/{companyId}/roles/{roleId}/permissions" });

export type UpdateRolePermissionsProps = z.infer<
  typeof UpdateRolePermissionsSchema
>;

// Validates and upserts the levels chosen for a role. Referential validation
// (level belongs to permission) happens in upsertRolePermissions.
export const updateRolePermissions = async (
  props: UpdateRolePermissionsProps,
) => {
  try {
    UpdateRolePermissionsSchema.parse(props);

    const { userId, roleId, scope } = props;

    const role = await selectRoleCompany({ roleId, scope });

    if (!role.exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Role not found"],
      };
    }

    // System/global role templates (null companyId) can't be edited.
    if (!role.companyId) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["System roles can't be edited"],
      };
    }

    await assertNotPersonalCompany({ userId, companyId: role.companyId });
    await assertCompanyPermission({
      userId,
      companyId: role.companyId,
      key: "roles",
      action: "update",
    });

    const assignments = await upsertRolePermissions(props);

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Role permissions updated",
      assignments,
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
      error = ["There was an error updating the role's permissions"],
    } = caught;

    throw { status, error };
  }
};
