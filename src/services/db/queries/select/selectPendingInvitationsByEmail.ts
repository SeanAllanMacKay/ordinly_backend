import { and, eq } from "drizzle-orm";
import { db, CompanyInvitation } from "../../index.js";

export type SelectPendingInvitationsByEmailProps = { email: string };

// Returns all pending invitations addressed to an email. Used by signUp to turn
// invitations into memberships once the invitee creates an account.
export const selectPendingInvitationsByEmail = async ({
  email,
}: SelectPendingInvitationsByEmailProps) => {
  return await db.query.CompanyInvitation.findMany({
    where: and(
      eq(CompanyInvitation.email, email),
      eq(CompanyInvitation.status, "pending"),
    ),
  });
};
