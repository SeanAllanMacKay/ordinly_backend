import { and, eq, isNull } from "drizzle-orm";

import { db, User, UserCompany } from "../../index.js";
import { fileService } from "../../../files/index.js";

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
        preferredLanguage: true,
        isVerified: true,
        createdDate: true,
      },
      with: { profilePicture: { columns: { externalPath: true } } },
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

  const { profilePicture, ...rest } = user;

  return {
    ...rest,
    // Public, immutable variant URLs the FE picks from via srcset; null -> the
    // FE renders initials.
    profilePicture: await fileService.buildProfilePictureURLs(
      profilePicture?.externalPath,
    ),
    personalCompany: personalCompany ? { id: personalCompany.companyId } : null,
  };
};
