import { eq } from "drizzle-orm";

import { db, User } from "../../index.js";

export const selectUserByVerificationCode = async ({
  verificationCode,
}: {
  verificationCode: string;
}) => {
  return await db.query.User.findFirst({
    where: eq(User.verificationCode, verificationCode),
    columns: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdDate: true,
    },
    with: {
      companies: true,
    },
  });
};
