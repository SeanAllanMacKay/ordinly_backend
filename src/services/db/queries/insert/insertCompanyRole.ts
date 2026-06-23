import { db, CompanyRole } from "../../index.js";

export type InsertCompanyRoleProps = {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
};

// Creates a company-specific role. Permissions are assigned separately via
// upsertRolePermissions (the existing PUT :roleId/permissions endpoint).
export const insertCompanyRole = async ({
  companyId,
  userId,
  name,
  description,
}: InsertCompanyRoleProps) => {
  const [role] = await db
    .insert(CompanyRole)
    .values({ companyId, name, description, createdBy: userId })
    .returning();

  return role;
};
