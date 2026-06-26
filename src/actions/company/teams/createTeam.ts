import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertTeam,
  selectCompanyMember,
  getAccessibleProjectIds,
  getAccessibleClientIds,
  setTeamProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import * as z from "zod";

// Array fields arrive as real arrays over JSON, but as JSON strings when the
// request is multipart (i.e. a profile picture is attached). Parse the string
// form so both content types validate the same way.
const idArray = (message: string) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, z.array(z.string(message)).optional());

const CreateTeamSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  memberIds: idArray("Invalid memberId"),
  projectIds: idArray("Invalid projectId"),
  clientIds: idArray("Invalid clientId"),
}).meta({ id: "POST /api/company/{companyId}/teams", route: "POST /api/company/{companyId}/teams" });

export type CreateTeamProps = z.infer<typeof CreateTeamSchema> & {
  // Optional avatar set at creation. Best-effort: an upload failure must not
  // block team creation.
  profilePicture?: Express.Multer.File;
};

// Creates a team. Every memberId must be a member of the company.
export const createTeam = async ({
  profilePicture,
  ...props
}: CreateTeamProps) => {
  try {
    const {
      userId,
      companyId,
      name,
      description,
      memberIds = [],
      projectIds,
      clientIds,
    } = CreateTeamSchema.parse(props);

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

    // Optional avatar set at creation. Best-effort: a failure here shouldn't
    // block team creation.
    let profilePictureURLs = null;
    if (profilePicture) {
      try {
        const upload = await fileService.uploadTeamProfilePicture({
          teamId: team.id,
          file: profilePicture,
        });
        await setTeamProfilePicture({
          teamId: team.id,
          companyId,
          userId,
          upload,
        });
        profilePictureURLs = await fileService.buildTeamProfilePictureURLs(
          upload.path,
        );
      } catch (pictureError) {
        console.log("Team profile picture upload failed", pictureError);
      }
    }

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Team created",
      team: { ...team, profilePicture: profilePictureURLs },
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
