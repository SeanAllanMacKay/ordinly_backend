import { Company, CompanyProfile, UserCompany, db } from "../../";

export type InsertCompanyProps = { userId: string } & Omit<
  typeof Company.$inferInsert,
  | "id"
  | "owner"
  | "profile"
  | "createdDate"
  | "createdBy"
  | "deletedDate"
  | "deletedBy"
>;

export const insertCompany = async ({
  userId,
  name,
  description,
}: InsertCompanyProps) => {
  return await db.transaction(async (transaction) => {
    const [profile] = await transaction
      .insert(CompanyProfile)
      .values({
        name,
        description,
      })
      .returning();

    const [company] = await transaction
      .insert(Company)
      .values({
        owner: userId,
        name,
        description,
        profile: profile.id,
        createdBy: userId,
      })
      .returning();

    await transaction.insert(UserCompany).values({
      userId,
      companyId: company.id,
      assignedBy: userId,
    });

    return company;
  });
};
