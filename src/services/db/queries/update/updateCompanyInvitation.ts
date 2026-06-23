import { and, eq } from "drizzle-orm";
import { db, CompanyInvitation } from "../../index.js";
import { companyInvitationStatus } from "../../constants.js";

export type UpdateCompanyInvitationProps = {
  invitationId: string;
  companyId?: string;
  status: (typeof companyInvitationStatus)[number];
};

// Transitions a pending invitation to a terminal status (accepted / revoked /
// declined) and stamps respondedDate. When companyId is provided the update is
// scoped to that company (used by the revoke endpoint); signup conversion omits
// it and updates by invitation id alone.
export const updateCompanyInvitation = async ({
  invitationId,
  companyId,
  status,
}: UpdateCompanyInvitationProps) => {
  const [invitation] = await db
    .update(CompanyInvitation)
    .set({ status, respondedDate: new Date() })
    .where(
      and(
        eq(CompanyInvitation.id, invitationId),
        eq(CompanyInvitation.status, "pending"),
        companyId ? eq(CompanyInvitation.companyId, companyId) : undefined,
      ),
    )
    .returning();

  return invitation;
};
