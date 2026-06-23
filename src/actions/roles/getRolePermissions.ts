import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import {
  selectPermissionCatalog,
  selectRolePermissions,
} from "../../services/db/index.js";
import * as z from "zod";

const GetRolePermissionsSchema = z.object({
  userId: z.string("Invalid userId"),
  roleId: z.string("Invalid roleId"),
  scope: z.enum(["company", "project"], "Invalid scope"),
});

export type GetRolePermissionsProps = z.infer<typeof GetRolePermissionsSchema>;

// Returns every catalog permission alongside the level currently assigned to
// the role. Permissions with no assignment fall back to the lowest level so the
// FE always has a value to render.
export const getRolePermissions = async (props: GetRolePermissionsProps) => {
  try {
    GetRolePermissionsSchema.parse(props);

    const { roleId, scope } = props;

    const [catalog, assignments] = await Promise.all([
      selectPermissionCatalog({ scope }),
      selectRolePermissions({ roleId, scope }),
    ]);

    const assignmentByPermission = new Map(
      assignments.map((assignment: any) => [
        assignment.permissionId,
        assignment,
      ]),
    );

    const permissions = catalog.map((permission: any) => {
      const assignment = assignmentByPermission.get(permission.id);
      const defaultLevel = permission.levels[0] ?? null;
      const level = assignment?.level ?? defaultLevel;

      return {
        id: permission.id,
        key: permission.key,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        levels: permission.levels,
        levelId: level?.id ?? null,
        levelValue: level?.value ?? null,
        assigned: Boolean(assignment),
      };
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Role permissions fetched",
      permissions,
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
      error = ["There was an error fetching the role's permissions"],
    } = caught;

    throw { status, error };
  }
};
