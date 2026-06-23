import { and, eq } from "drizzle-orm";
import { db, CompanyInvitation } from "../../index.js";

export type SelectCompanyInvitationsProps = { companyId: string };

// Lists a company's pending invitations, each with the role the invitee will
// receive on acceptance.
export const selectCompanyInvitations = async ({
  companyId,
}: SelectCompanyInvitationsProps) => {
  return await db.query.CompanyInvitation.findMany({
    where: and(
      eq(CompanyInvitation.companyId, companyId),
      eq(CompanyInvitation.status, "pending"),
    ),
    with: { role: true },
    orderBy: (invitation, { desc }) => desc(invitation.invitedDate),
  });
};
