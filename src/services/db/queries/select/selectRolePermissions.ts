import { and, eq, isNull } from "drizzle-orm";
import { db, CompanyRolePermission, ProjectRolePermission } from "../../index.js";

export type SelectRolePermissionsProps = {
  roleId: string;
  scope: "company" | "project";
};

// Returns a role's current (non-deleted) permission assignments, each with its
// catalog permission and chosen level resolved.
export const selectRolePermissions = async ({
  roleId,
  scope,
}: SelectRolePermissionsProps) => {
  if (scope === "project") {
    return await db.query.ProjectRolePermission.findMany({
      where: and(
        eq(ProjectRolePermission.roleId, roleId),
        isNull(ProjectRolePermission.deletedDate),
      ),
      with: { permission: true, level: true },
    });
  }

  return await db.query.CompanyRolePermission.findMany({
    where: and(
      eq(CompanyRolePermission.roleId, roleId),
      isNull(CompanyRolePermission.deletedDate),
    ),
    with: { permission: true, level: true },
  });
};
