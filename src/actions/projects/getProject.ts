import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProject,
  SelectProjectProps,
  getAccessibleClientIds,
  selectProjectConnections,
  selectUsersForProject,
  selectTeamsForProject,
} from "../../services/db/index.js";
import { assertCompanyAssetPermission } from "../permissions/index.js";
import * as z from "zod";
import { getBatchLocationData } from "../../services/maps/getBatchProjectLocationData.js";

const GetProjectsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  projectId: z.string("Invalid projectId"),
});

export const getProject = async (getProjectProps: SelectProjectProps) => {
  try {
    GetProjectsSchema.parse(getProjectProps);

    const { userId, companyId, projectId } = getProjectProps;

    await assertCompanyAssetPermission({
      userId,
      companyId,
      scope: "project",
      assetId: projectId,
      action: "read",
    });

    const project = await selectProject(getProjectProps);

    if (!project) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    // Attach connected clients/contacts, filtered to what the caller may see
    // (their client-read scope; contacts inherit their client's visibility).
    const clientAccess = await getAccessibleClientIds({ userId, companyId });
    const connections = await selectProjectConnections({
      projectId,
      companyId,
      clientAccess,
    });

    // Assigned users + linked teams (assignment-by-team is derived from these).
    const [users, teams] = await Promise.all([
      selectUsersForProject({ projectId, companyId }),
      selectTeamsForProject({ projectId }),
    ]);

    const [hydrated] = await getBatchLocationData({ projects: [project] });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Project fetched",
      project: { ...hydrated, ...connections, users, teams },
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
      error = ["There was an error fetching your projects"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
