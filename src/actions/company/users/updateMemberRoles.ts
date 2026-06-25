import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectCompanyMember,
  selectCompanyRole,
  updateMemberRoles as updateMemberRolesQuery,
  getAccessibleProjectIds,
  getAccessibleClientIds,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import { validateCompanyTeams } from "../../util/validateConnections.js";
import * as z from "zod";

const UpdateMemberRolesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  memberId: z.string("Invalid memberId"),
  roleIds: z.array(z.string("Invalid roleId")).optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  clientIds: z.array(z.string("Invalid clientId")).optional(),
  teamIds: z.array(z.string("Invalid teamId")).optional(),
}).meta({ id: "PUT /api/company/{companyId}/users/{userId}", route: "PUT /api/company/{companyId}/users/{userId}" });

export type UpdateMemberRolesProps = z.infer<typeof UpdateMemberRolesSchema>;

// Replaces a member's role assignments. Every role must be assignable by the
// company (its own or a system role).
export const updateMemberRoles = async (props: UpdateMemberRolesProps) => {
  try {
    UpdateMemberRolesSchema.parse(props);

    const { userId, companyId, memberId, roleIds, projectIds, clientIds, teamIds } =
      props;

    if (
      roleIds === undefined &&
      projectIds === undefined &&
      clientIds === undefined &&
      teamIds === undefined
    ) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["Nothing to update"],
      };
    }

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
    if (roleIds?.length) {
      const roleChecks = await Promise.all(
        roleIds.map((roleId) => selectCompanyRole({ roleId, companyId })),
      );

      if (roleChecks.some((check) => !check.exists)) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
          error: ["One or more roles were not found"],
        };
      }
    }

    // Linked teams must belong to the company.
    await validateCompanyTeams({ companyId, teamIds });

    // Connecting projects/clients requires the relevant read tier; we only
    // reconcile within the projects/clients the acting admin can see.
    let projectAccess;
    if (projectIds !== undefined) {
      projectAccess = await getAccessibleProjectIds({ userId, companyId });
      if (!projectAccess.canRead) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
          error: ["You don't have permission to connect projects"],
        };
      }
    }
    let clientAccess;
    if (clientIds !== undefined) {
      clientAccess = await getAccessibleClientIds({ userId, companyId });
      if (!clientAccess.canRead) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
          error: ["You don't have permission to connect clients"],
        };
      }
    }

    await updateMemberRolesQuery({
      companyId,
      userId: memberId,
      assignedBy: userId,
      roleIds,
      projectIds,
      clientIds,
      teamIds,
      projectAccess,
      clientAccess,
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
