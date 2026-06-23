import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectCompanyById,
  updateCompanyInvitation,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import send from "../../../services/email/index.js";
import * as z from "zod";

const RevokeCompanyInvitationSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  invitationId: z.string("Invalid invitationId"),
});

export type RevokeCompanyInvitationProps = z.infer<
  typeof RevokeCompanyInvitationSchema
>;

// Revokes a pending invitation so it can no longer be accepted on signup.
export const revokeCompanyInvitation = async (
  props: RevokeCompanyInvitationProps,
) => {
  try {
    RevokeCompanyInvitationSchema.parse(props);

    const { userId, companyId, invitationId } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "delete",
    });

    const invitation = await updateCompanyInvitation({
      invitationId,
      companyId,
      status: "revoked",
    });

    if (!invitation) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Invitation not found"],
      };
    }

    const company = await selectCompanyById({ companyId });

    await send({
      email: invitation.email,
      type: "revokedInvitationToCompany",
      companyName: company?.name ?? "a company",
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Invitation revoked",
    };
  } catch (caught: any) {
    console.log(caught);
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error revoking the invitation"],
    } = caught;

    throw { status, error };
  }
};
