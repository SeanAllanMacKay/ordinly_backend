import { eq } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

import {
  db,
  CompanyPermission,
  CompanyPermissionLevel,
  ProjectPermission,
  ProjectPermissionLevel,
} from "../index.js";
import {
  companyPermissionCatalog,
  projectPermissionCatalog,
  PermissionSeed,
} from "./permissionCatalog.js";

// Idempotent upsert of one scope's catalog. Permissions are keyed by `key`,
// levels by `(permissionId, value)`, so re-running refreshes descriptions/CRUD
// and adds any new permissions or levels without creating duplicates.
const seedScope = async (
  label: string,
  permissionTable: PgTable & { key: any },
  levelTable: PgTable & { permissionId: any; value: any },
  catalog: Record<string, PermissionSeed>,
) => {
  const entries = Object.entries(catalog);

  for (const [key, permission] of entries) {
    const sortOrder = entries.findIndex(([k]) => k === key);

    await db
      .insert(permissionTable as any)
      .values({
        key,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        sortOrder,
      })
      .onConflictDoUpdate({
        target: (permissionTable as any).key,
        set: {
          name: permission.name,
          description: permission.description,
          category: permission.category,
          sortOrder,
        },
      });

    const [{ id: permissionId }] = await db
      .select({ id: (permissionTable as any).id })
      .from(permissionTable as any)
      .where(eq((permissionTable as any).key, key));

    for (let j = 0; j < permission.levels.length; j++) {
      const level = permission.levels[j];
      await db
        .insert(levelTable as any)
        .values({ ...level, permissionId, sortOrder: j })
        .onConflictDoUpdate({
          target: [(levelTable as any).permissionId, (levelTable as any).value],
          set: {
            name: level.name,
            description: level.description,
            create: level.create,
            read: level.read,
            update: level.update,
            delete: level.delete,
            sortOrder: j,
          },
        });
    }
  }

  console.log(`${label}: upserted ${entries.length} permissions`);
};

export const seedPermissions = async () => {
  await seedScope(
    "CompanyPermission",
    CompanyPermission,
    CompanyPermissionLevel,
    companyPermissionCatalog,
  );
  await seedScope(
    "ProjectPermission",
    ProjectPermission,
    ProjectPermissionLevel,
    projectPermissionCatalog,
  );
};
