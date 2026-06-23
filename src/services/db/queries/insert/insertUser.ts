import { and, eq, isNull } from "drizzle-orm";

import {
  Company,
  CompanyRole,
  db,
  User,
  UserCompany,
  UserCompanyRole,
} from "../../index.js";

export type InsertUserProps = Omit<
  typeof User.$inferInsert,
  "id" | "isVerified" | "verificationCode" | "createdDate" | "deletedDate"
>;

export const insertUser = async ({
  name,
  email,
  password,
}: InsertUserProps) => {
  return await db.transaction(async (transaction) => {
    const [user] = await transaction
      .insert(User)
      .values({
        name,
        email,
        password,
        isVerified: false,
      })
      .returning({
        id: User.id,
        createdDate: User.createdDate,
        email: User.email,
        isVerified: User.isVerified,
        name: User.name,
        verificationCode: User.verificationCode,
      });

    const [personalCompany] = await transaction
      .insert(Company)
      .values({
        name: `${user.name}'s personal company`,
        owner: user.id,
        isPersonal: true,
        createdBy: user.id,
      })
      .returning();

    const [userCompany] = await transaction
      .insert(UserCompany)
      .values({
        userId: user.id,
        companyId: personalCompany.id,
        isPersonal: true,
        assignedBy: user.id,
      })
      .returning();

    // Assign the global "Owner" role so the user has a role row in their
    // personal company (mirrors insertCompany). Owner-bypass also covers them
    // via Company.owner, but this keeps the RBAC data consistent.
    const [ownerRole] = await transaction
      .select({ id: CompanyRole.id })
      .from(CompanyRole)
      .where(and(eq(CompanyRole.name, "Owner"), isNull(CompanyRole.companyId)));

    if (!ownerRole) {
      throw new Error(
        'Global "Owner" CompanyRole not found — run seedCompanyRoles() first.',
      );
    }

    await transaction.insert(UserCompanyRole).values({
      userCompanyId: userCompany.id,
      roleId: ownerRole.id,
    });

    return user;
  });
};
