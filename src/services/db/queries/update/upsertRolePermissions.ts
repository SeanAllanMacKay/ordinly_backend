import { inArray } from "drizzle-orm";
import {
  db,
  CompanyRolePermission,
  ProjectRolePermission,
  CompanyPermissionLevel,
  ProjectPermissionLevel,
} from "../../index.js";

export type RolePermissionAssignment = {
  permissionId: string;
  levelId: string;
};

export type UpsertRolePermissionsProps = {
  roleId: string;
  userId: string;
  scope: "company" | "project";
  permissions: RolePermissionAssignment[];
};

// Upserts a role's permission assignments. Each assignment references a level
// from the catalog; the level is validated to belong to the named permission
// before writing. Conflicts on (roleId, permissionId) update the chosen level.
export const upsertRolePermissions = async ({
  roleId,
  userId,
  scope,
  permissions,
}: UpsertRolePermissionsProps) => {
  if (!permissions.length) return [];

  const isProject = scope === "project";
  const table: any = isProject ? ProjectRolePermission : CompanyRolePermission;
  const levelTable: any = isProject
    ? ProjectPermissionLevel
    : CompanyPermissionLevel;

  // Validate every chosen level belongs to its permission.
  const levels = await db
    .select({ id: levelTable.id, permissionId: levelTable.permissionId })
    .from(levelTable)
    .where(
      inArray(
        levelTable.id,
        permissions.map((permission) => permission.levelId),
      ),
    );

  const permissionByLevel = new Map(
    levels.map((level: any) => [level.id, level.permissionId]),
  );

  for (const { permissionId, levelId } of permissions) {
    if (permissionByLevel.get(levelId) !== permissionId) {
      throw {
        status: 400,
        error: [`Level "${levelId}" is not valid for this permission`],
      };
    }
  }

  return await db.transaction(async (transaction) => {
    const rows = [];
    for (const { permissionId, levelId } of permissions) {
      const inserted = (await transaction
        .insert(table)
        .values({ roleId, permissionId, levelId, createdBy: userId })
        .onConflictDoUpdate({
          target: [table.roleId, table.permissionId],
          set: { levelId, deletedDate: null, deletedBy: null },
        })
        .returning()) as any[];
      rows.push(inserted[0]);
    }
    return rows;
  });
};
