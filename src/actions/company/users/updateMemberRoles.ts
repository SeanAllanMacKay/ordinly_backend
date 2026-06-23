import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectCompanyMember,
  selectCompanyRole,
  updateMemberRoles as updateMemberRolesQuery,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const UpdateMemberRolesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  memberId: z.string("Invalid memberId"),
  roleIds: z.array(z.string("Invalid roleId")),
}).meta({ id: "PUT /api/company/{companyId}/users/{userId}", route: "PUT /api/company/{companyId}/users/{userId}" });

export type UpdateMemberRolesProps = z.infer<typeof UpdateMemberRolesSchema>;

// Replaces a member's role assignments. Every role must be assignable by the
// company (its own or a system role).
export const updateMemberRoles = async (props: UpdateMemberRolesProps) => {
  try {
    UpdateMemberRolesSchema.parse(props);

    const { userId, companyId, memberId, roleIds } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "update",
    });

    const { exists } = await selectCompanyMember({
      userId: memberId,
      companyId,
    });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Member not found"],
      };
    }

    // Validate every requested role is assignable by this company.
    const roleChecks = await Promise.all(
      roleIds.map((roleId) => selectCompanyRole({ roleId, companyId })),
    );

    if (roleChecks.some((check) => !check.exists)) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["One or more roles were not found"],
      };
    }

    await updateMemberRolesQuery({
      companyId,
      userId: memberId,
      roleIds,
      assignedBy: userId,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Member roles updated",
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
      error = ["There was an error updating the member's roles"],
    } = caught;

    throw { status, error };
  }
};
