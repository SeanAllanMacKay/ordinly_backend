import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertTeam,
  selectCompanyMember,
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
}).meta({ id: "POST /api/company/{companyId}/teams", route: "POST /api/company/{companyId}/teams" });

export type CreateTeamProps = z.infer<typeof CreateTeamSchema>;

// Creates a team. Every memberId must be a member of the company.
export const createTeam = async (props: CreateTeamProps) => {
  try {
    CreateTeamSchema.parse(props);

    const { userId, companyId, name, description, memberIds = [] } = props;

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

    const team = await insertTeam({
      companyId,
      userId,
      name,
      description,
      memberIds,
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
