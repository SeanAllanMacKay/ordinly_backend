import { and, eq } from "drizzle-orm";
import { db, CompanyInvitation } from "../../index.js";

export type InsertCompanyInvitationProps = {
  companyId: string;
  email: string;
  roleId: string;
  invitedBy: string;
};

// Creates a pending invitation for a not-yet-registered user. Rejects if a
// pending invite already exists for the same (companyId, email) so we don't
// send duplicates. Throws in the action error convention on conflict.
export const insertCompanyInvitation = async ({
  companyId,
  email,
  roleId,
  invitedBy,
}: InsertCompanyInvitationProps) => {
  return await db.transaction(async (transaction) => {
    const existing = await transaction
      .select({ id: CompanyInvitation.id })
      .from(CompanyInvitation)
      .where(
        and(
          eq(CompanyInvitation.companyId, companyId),
          eq(CompanyInvitation.email, email),
          eq(CompanyInvitation.status, "pending"),
        ),
      );

    if (existing.length) {
      throw {
        status: 409,
        error: ["This person already has a pending invitation"],
      };
    }

    const [invitation] = await transaction
      .insert(CompanyInvitation)
      .values({ companyId, email, roleId, invitedBy })
      .returning();

    return invitation;
  });
};
