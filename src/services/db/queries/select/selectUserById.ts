import { and, eq } from "drizzle-orm";

import { db, User, UserCompany } from "../../index.js";

export const selectUserById = async ({ userId }: { userId: string }) => {
  const [user, personalCompany] = await Promise.all([
    db.query.User.findFirst({
      where: eq(User.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        createdDate: true,
      },
    }),
    db.query.UserCompany.findFirst({
      where: and(
        eq(UserCompany.userId, userId),
        eq(UserCompany.isPersonal, true),
      ),
      columns: { companyId: true },
    }),
  ]);

  if (!user) return user;

  return {
    ...user,
    personalCompany: personalCompany ? { id: personalCompany.companyId } : null,
  };
};
