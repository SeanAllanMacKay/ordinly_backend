import { and, count, eq, isNull } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";
import { fileService } from "../../../files/index.js";

export type SelectCompanyMembersProps = {
  companyId: string;
  page?: number;
  pageSize?: number;
};

// Lists a company's members (non-deleted UserCompany rows) with each member's
// user details and their currently-assigned roles. Paginated like selectCompanies.
export const selectCompanyMembers = async ({
  companyId,
  page = 1,
  pageSize = 15,
}: SelectCompanyMembersProps) => {
  const [{ totalItems }] = await db
    .select({ totalItems: count() })
    .from(UserCompany)
    .where(
      and(
        eq(UserCompany.companyId, companyId),
        isNull(UserCompany.deletedDate),
      ),
    );

  const members = await db.query.UserCompany.findMany({
    where: and(
      eq(UserCompany.companyId, companyId),
      isNull(UserCompany.deletedDate),
    ),
    columns: { id: true, userId: true, companyId: true, assignedDate: true },
    with: {
      user: {
        columns: { id: true, name: true, email: true, isVerified: true },
        with: { profilePicture: { columns: { externalPath: true } } },
      },
      roles: {
        where: isNull(UserCompanyRole.deletedDate),
        with: { role: true },
      },
    },
    orderBy: (userCompany, { asc }) => asc(userCompany.assignedDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    members: await Promise.all(members.map(attachMemberAvatar)),
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};

// Replaces the embedded profilePicture Document with a public variant URL map
// (or null) the FE can render via srcset. Shared with selectCompanyMember.
export const attachMemberAvatar = async <
  T extends { user: { profilePicture?: { externalPath: string } | null } },
>(
  member: T,
) => {
  const { profilePicture, ...user } = member.user;

  return {
    ...member,
    user: {
      ...user,
      profilePicture: await fileService.buildProfilePictureURLs(
        profilePicture?.externalPath,
      ),
    },
  };
};
