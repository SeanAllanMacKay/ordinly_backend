import { db, User } from "../../";

export type InsertUserProps = Omit<
  typeof User.$inferInsert,
  "id" | "isVerified" | "verificationCode" | "createdDate" | "deletedDate"
>;

export const insertUser = async ({
  name,
  email,
  password,
}: InsertUserProps) => {
  const [user] = await db
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

  return user;
};
