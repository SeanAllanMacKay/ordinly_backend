import { eq } from "drizzle-orm";

import { db, User, UserCompany } from "../../index.js";

export const selectUserById = async ({ userId }: { userId: string }) => {
  return await db.query.User.findFirst({
    where: eq(User.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdDate: true,
    },
    with: {
      companies: {
        where: eq(UserCompany.isPersonal, false),
        columns: {},
        with: {
          company: true,
        },
      },
    },
  });
};
