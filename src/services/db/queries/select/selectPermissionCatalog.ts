import { db } from "../../index.js";

export type SelectPermissionCatalogProps = {
  scope: "company" | "project";
};

// Returns the full permission catalog for a scope — each permission with its
// ordered levels — to power the role-management dropdowns.
export const selectPermissionCatalog = async ({
  scope,
}: SelectPermissionCatalogProps) => {
  const withLevels = {
    levels: {
      orderBy: (level: any, { asc }: any) => asc(level.sortOrder),
    },
  } as const;

  if (scope === "project") {
    return await db.query.ProjectPermission.findMany({
      with: withLevels,
      orderBy: (permission, { asc }) => asc(permission.sortOrder),
    });
  }

  return await db.query.CompanyPermission.findMany({
    with: withLevels,
    orderBy: (permission, { asc }) => asc(permission.sortOrder),
  });
};
