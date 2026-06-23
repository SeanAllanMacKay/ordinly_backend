import { isNull } from "drizzle-orm";

import {
  db,
  CompanyRole,
  CompanyRolePermission,
  CompanyPermission,
  CompanyPermissionLevel,
} from "../index.js";
import { companyRoleCatalog } from "./companyRoleCatalog.js";

// Idempotently seeds the default global company roles (companyId = NULL) and
// their permission-level assignments. Roles are matched by name (CompanyRole
// has no unique constraint usable for onConflict), so re-running reuses the
// existing role; permission rows upsert on the unique(roleId, permissionId)
// constraint, refreshing the level in place rather than duplicating.
//
// Depends on seedPermissions() having run first — it resolves permission keys
// and level values against the catalog tables.
export const seedCompanyRoles = async () => {
  const roleNames = Object.keys(companyRoleCatalog);

  // 1. Upsert the global roles by name, building a name -> roleId map.
  const existingRoles = await db
    .select({ id: CompanyRole.id, name: CompanyRole.name })
    .from(CompanyRole)
    .where(isNull(CompanyRole.companyId));

  const roleIdByName = new Map(existingRoles.map((r) => [r.name, r.id]));

  for (const name of roleNames) {
    if (roleIdByName.has(name)) continue;
    const [inserted] = await db
      .insert(CompanyRole)
      .values({ name, description: companyRoleCatalog[name].description })
      .returning({ id: CompanyRole.id });
    roleIdByName.set(name, inserted.id);
  }

  // 2. Load lookup maps once: permission key -> id, (permissionId, value) -> levelId.
  const permissions = await db
    .select({ id: CompanyPermission.id, key: CompanyPermission.key })
    .from(CompanyPermission);
  const permissionIdByKey = new Map(permissions.map((p) => [p.key, p.id]));

  const levels = await db
    .select({
      id: CompanyPermissionLevel.id,
      permissionId: CompanyPermissionLevel.permissionId,
      value: CompanyPermissionLevel.value,
    })
    .from(CompanyPermissionLevel);
  const levelIdByKey = new Map(
    levels.map((l) => [`${l.permissionId}:${l.value}`, l.id]),
  );

  // 3. Upsert each role's permission assignments.
  for (const name of roleNames) {
    const roleId = roleIdByName.get(name)!;
    const grants = companyRoleCatalog[name].permissions;
    let count = 0;

    for (const [key, value] of Object.entries(grants)) {
      const permissionId = permissionIdByKey.get(key);
      if (!permissionId) {
        console.warn(`  skip ${name}: unknown permission "${key}"`);
        continue;
      }
      const levelId = levelIdByKey.get(`${permissionId}:${value}`);
      if (!levelId) {
        console.warn(
          `  skip ${name}.${key}: unknown level "${value}" for that permission`,
        );
        continue;
      }

      await db
        .insert(CompanyRolePermission)
        .values({ roleId, permissionId, levelId })
        .onConflictDoUpdate({
          target: [
            CompanyRolePermission.roleId,
            CompanyRolePermission.permissionId,
          ],
          set: { levelId },
        });
      count++;
    }

    console.log(`CompanyRole "${name}": ${count} permission grants`);
  }

  console.log(`CompanyRole: upserted ${roleNames.length} global roles`);
};
