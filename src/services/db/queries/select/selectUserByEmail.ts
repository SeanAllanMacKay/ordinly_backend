import { eq } from "drizzle-orm";

import { db, User } from "../../";

export const selectUserByEmail = async ({ email }: { email: string }) => {
  return await db.query.User.findFirst({
    where: eq(User.email, email),
  });
};
