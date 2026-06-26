import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertClient,
  getAccessibleProjectIds,
  setClientProfilePicture,
} from "../../../services/db/index.js";
import { fileService } from "../../../services/files/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import {
  validateCompanyMembers,
  validateCompanyTeams,
} from "../../util/validateConnections.js";
import { coerceJsonFields } from "../../util/multipart.js";
import * as z from "zod";
import { NestedContactSchema, contactInfoFields } from "./schemas.js";

const CreateClientSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  clientCompanyId: z.string("Invalid clientCompanyId").optional(),
  clientUserId: z.string("Invalid clientUserId").optional(),
  contacts: z.array(NestedContactSchema).optional(),
  projectIds: z.array(z.string("Invalid projectId")).optional(),
  userIds: z.array(z.string("Invalid userId")).optional(),
  teamIds: z.array(z.string("Invalid teamId")).optional(),
  ...contactInfoFields,
}).meta({
  id: "POST /api/company/{companyId}/clients",
  route: "POST /api/company/{companyId}/clients",
});

export type CreateClientProps = z.infer<typeof CreateClientSchema> & {
  // Optional avatar set at creation. Best-effort: an upload failure must not
  // block client creation.
  profilePicture?: Express.Multer.File;
};

// Creates a client with its contact info and any nested contacts. Requires the
// all_clients create permission (you can't be "assigned" to a new client).
export const createClient = async ({
  profilePicture,
  ...raw
}: CreateClientProps) => {
  try {
    // Structured fields arrive as JSON strings when the request is multipart
    // (i.e. a profile picture is attached); decode them before validation.
    const props = coerceJsonFields(raw, [
      "contacts",
      "projectIds",
      "userIds",
      "teamIds",
      "phoneNumbers",
      "emails",
      "locations",
    ]);

    CreateClientSchema.parse(props);

    const { userId, companyId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_clients",
      action: "create",
    });

    // Connecting projects additionally requires the project-read tier; we only
    // reconcile within the projects the user can see.
    let projectAccess;
    if (props.projectIds !== undefined) {
      projectAccess = await getAccessibleProjectIds({ userId, companyId });
      if (!projectAccess.canRead) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
          error: ["You don't have permission to connect projects"],
        };
      }
    }

    // Linked users/teams must belong to the company.
    await validateCompanyMembers({ companyId, userIds: props.userIds });
    await validateCompanyTeams({ companyId, teamIds: props.teamIds });

    const client = await insertClient({ ...props, projectAccess });

    // Optional avatar set at creation. Best-effort: a failure here shouldn't
    // block client creation.
    let profilePictureURLs = null;
    if (profilePicture) {
      try {
        const upload = await fileService.uploadClientProfilePicture({
          clientId: client.id,
          file: profilePicture,
        });
        await setClientProfilePicture({
          clientId: client.id,
          companyId,
          userId,
          upload,
        });
        profilePictureURLs = await fileService.buildClientProfilePictureURLs(
          upload.path,
        );
      } catch (pictureError) {
        console.log("Client profile picture upload failed", pictureError);
      }
    }

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Client created",
      client: { ...client, profilePicture: profilePictureURLs },
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
      error = ["There was an error creating the client"],
    } = caught;

    throw { status, error };
  }
};
