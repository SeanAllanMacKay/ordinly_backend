import { eq } from "drizzle-orm";
import { db, User } from "../../";

export type UpdateUserProps = { userId: string } & Partial<
  Omit<typeof User.$inferInsert, "id" | "verificationCode" | "createdDate">
>;

export const updateUserById = async ({
  userId,
  ...insertProps
}: UpdateUserProps) => {
  const [user] = await db
    .update(User)
    .set(insertProps)
    .where(eq(User.id, userId))

    .returning();

  return user;
};
