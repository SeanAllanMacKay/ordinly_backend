import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectUserByEmail,
  selectCompanyRole,
  selectCompanyById,
  insertCompanyMember,
  insertCompanyInvitation,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import send from "../../../services/email/index.js";
import * as z from "zod";

const InviteUserSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  email: z.email("A valid email is required"),
  roleId: z.string("Invalid roleId"),
}).meta({ id: "POST /api/company/{companyId}/users", route: "POST /api/company/{companyId}/users" });

export type InviteUserProps = z.infer<typeof InviteUserSchema>;

// Invites a person to the company by email. Existing users are added as members
// immediately; brand-new users get a pending invitation that signUp converts on
// account creation.
export const inviteUser = async (props: InviteUserProps) => {
  try {
    InviteUserSchema.parse(props);

    const { userId, companyId, email, roleId } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "create",
    });

    // The role must be one the company can assign (its own or a system role).
    const { exists: roleExists } = await selectCompanyRole({
      roleId,
      companyId,
    });

    if (!roleExists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["Role not found"],
      };
    }

    const company = await selectCompanyById({ companyId });
    const companyName = company?.name ?? "a company";

    const existingUser = await selectUserByEmail({ email });

    if (existingUser) {
      await insertCompanyMember({
        companyId,
        userId: existingUser.id,
        roleIds: [roleId],
        assignedBy: userId,
      });

      await send({
        email,
        type: "existingUserInvitedToCompany",
        companyName,
      });

      return {
        status: HTTP_STATUSES.SUCCESS.CREATED,
        message: "User added to the company",
      };
    }

    const invitation = await insertCompanyInvitation({
      companyId,
      email,
      roleId,
      invitedBy: userId,
    });

    await send({ email, type: "newUserInvitedToCompany", companyName });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Invitation sent",
      invitation,
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
      error = ["There was an error inviting this person"],
    } = caught;

    throw { status, error };
  }
};
