import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectClientOptions,
  resolveCompanyPermissions,
} from "../../../services/db/index.js";
import * as z from "zod";

const ListClientOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  search: z.string().optional(),
}).meta({
  id: "GET /api/company/{companyId}/clients/options",
  route: "GET /api/company/{companyId}/clients/options",
});

export type ListClientOptionsProps = z.infer<typeof ListClientOptionsSchema>;

// Slimmed-down { value, label } client list for FE selects. Reuses the clients
// read scope: all_clients.read → every client; assigned_clients.read → assigned only.
export const listClientOptions = async (props: ListClientOptionsProps) => {
  try {
    ListClientOptionsSchema.parse(props);

    const { userId, companyId, search } = props;

    const { isOwner, permissions } = await resolveCompanyPermissions({
      userId,
      companyId,
    });
    const canAll = isOwner || !!permissions["all_clients"]?.read;
    const canAssigned = isOwner || !!permissions["assigned_clients"]?.read;

    if (!canAll && !canAssigned) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["You don't have permission to view these clients"],
      };
    }

    const options = await selectClientOptions({
      userId,
      companyId,
      assignedOnly: !canAll,
      search,
    });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Client options fetched",
      options,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching the client options"],
    } = caught;

    throw { status, error };
  }
};
