import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  updateTeam as updateTeamQuery,
  selectCompanyMember,
  getAccessibleProjectIds,
  getAccessibleClientIds,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const UpdateTeamSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  teamId: z.string("Invalid teamId"),
  name: z.string("Name must be a string").optional(),
  description: z.string("Description must be a string if passed").optional(),
  memberIds: z.array(z.string("Invalid memberId")).optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  clientIds: z.array(z.string("Invalid clientId")).optional(),
}).meta({ id: "PUT /api/company/{companyId}/teams/{teamId}", route: "PUT /api/company/{companyId}/teams/{teamId}" });

export type UpdateTeamProps = z.infer<typeof UpdateTeamSchema>;

// Updates a team's name/description and, when memberIds is provided, reconciles
// its membership to that exact set (each must be a company member).
export const updateTeam = async (props: UpdateTeamProps) => {
  try {
    UpdateTeamSchema.parse(props);

    const {
      userId,
      companyId,
      teamId,
      name,
      description,
      memberIds,
      projectIds,
      clientIds,
    } = props;

    if (
      name === undefined &&
      description === undefined &&
      memberIds === undefined &&
      projectIds === undefined &&
      clientIds === undefined
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
      key: "teams",
      action: "update",
    });

    if (memberIds?.length) {
      const checks = await Promise.all(
        memberIds.map((memberId) =>
          selectCompanyMember({ userId: memberId, companyId }),
        ),
      );

      if (checks.some((check) => !check.exists)) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
          error: ["One or more members don't belong to this company"],
        };
      }
    }

    // Connecting projects/clients requires the relevant read tier; we only
    // reconcile within the projects/clients the user can see.
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

    const team = await updateTeamQuery({
      teamId,
      companyId,
      userId,
      name,
      description,
      memberIds,
      projectIds,
      clientIds,
      projectAccess,
      clientAccess,
    });

    if (!team) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Team not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Team updated",
      team,
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
      error = ["There was an error updating the team"],
    } = caught;

    throw { status, error };
  }
};
