import { Company, db, User, UserCompany } from "../../index.js";

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

    await transaction.insert(UserCompany).values({
      userId: user.id,
      companyId: personalCompany.id,
      isPersonal: true,
      assignedBy: user.id,
    });

    return user;
  });
};
