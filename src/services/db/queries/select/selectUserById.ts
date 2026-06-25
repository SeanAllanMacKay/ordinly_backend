import { and, eq, isNull } from "drizzle-orm";

import { db, User, UserCompany } from "../../index.js";

export const selectUserById = async ({ userId }: { userId: string }) => {
  const [user, personalCompany] = await Promise.all([
    db.query.User.findFirst({
      // Exclude soft-deleted accounts so a lingering auth cookie can't be used
      // during the deletion grace window. Restore happens via login, which uses
      // selectUserByEmail (no such filter), not this read.
      where: and(eq(User.id, userId), isNull(User.deletedDate)),
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
