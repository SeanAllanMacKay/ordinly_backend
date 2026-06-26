import { and, eq, isNull } from "drizzle-orm";
import { db, UserCompany, UserCompanyRole } from "../../index.js";
import { attachMemberAvatar } from "./selectCompanyMembers.js";

export type SelectCompanyMemberProps = { userId: string; companyId: string };

// Fetches a single company member (by userId) with their user details and
// currently-assigned roles. Returns { exists, member } for clean 404 handling.
export const selectCompanyMember = async ({
  userId,
  companyId,
}: SelectCompanyMemberProps) => {
  const member = await db.query.UserCompany.findFirst({
    where: and(
      eq(UserCompany.userId, userId),
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
  });

  return {
    exists: !!member,
    member: member ? await attachMemberAvatar(member) : member,
  };
};
