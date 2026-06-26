import { and, asc, eq, isNull } from "drizzle-orm";

import { db, UserCompany, User, Document } from "../../index.js";
import { fileService } from "../../../files/index.js";
import { PROFILE_PICTURE_SIZES } from "../../../files/constants.js";
import { OPTIONS_LIMIT, optionSearch } from "../util/optionFilters.js";

export type SelectMemberOptionsProps = {
  companyId: string;
  search?: string;
};

// Smallest variant — option rows render a tiny avatar next to the label.
const THUMB_SIZE = PROFILE_PICTURE_SIZES[0];

// Slimmed-down { value, label, imageUrl } list of a company's (non-deleted)
// members for FE selects. value is the User id (members are assigned to
// teams/tasks/approvers by user), label is the user's name, imageUrl is the
// member's avatar thumbnail (undefined when unset).
export const selectMemberOptions = async ({
  companyId,
  search,
}: SelectMemberOptionsProps) => {
  const rows = await db
    .select({
      value: User.id,
      label: User.name,
      avatarPath: Document.externalPath,
    })
    .from(UserCompany)
    .innerJoin(User, eq(User.id, UserCompany.userId))
    .leftJoin(Document, eq(Document.id, User.profilePicture))
    .where(
      and(
        eq(UserCompany.companyId, companyId),
        isNull(UserCompany.deletedDate),
        optionSearch(User.name, search),
      ),
    )
    .orderBy(asc(User.name))
    .limit(OPTIONS_LIMIT);

  return Promise.all(
    rows.map(async ({ avatarPath, ...option }) => ({
      ...option,
      imageUrl: (await fileService.buildProfilePictureURLs(avatarPath))?.[
        THUMB_SIZE
      ],
    })),
  );
};
