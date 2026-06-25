import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertTeam,
  selectCompanyMember,
  getAccessibleProjectIds,
  getAccessibleClientIds,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

const CreateTeamSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  memberIds: z.array(z.string("Invalid memberId")).optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  clientIds: z.array(z.string("Invalid clientId")).optional(),
}).meta({ id: "POST /api/company/{companyId}/teams", route: "POST /api/company/{companyId}/teams" });

export type CreateTeamProps = z.infer<typeof CreateTeamSchema>;

// Creates a team. Every memberId must be a member of the company.
export const createTeam = async (props: CreateTeamProps) => {
  try {
    CreateTeamSchema.parse(props);

    const {
      userId,
      companyId,
      name,
      description,
      memberIds = [],
      projectIds,
      clientIds,
    } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "teams",
      action: "create",
    });

    if (memberIds.length) {
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

    const team = await insertTeam({
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

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Team created",
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
      error = ["There was an error creating the team"],
    } = caught;

    throw { status, error };
  }
};
