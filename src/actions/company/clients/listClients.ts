import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectClients,
  resolveCompanyPermissions,
} from "../../../services/db/index.js";
import * as z from "zod";

const ListClientsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  page: z.coerce.number("Page must be a number if passed").optional(),
  pageSize: z.coerce.number("pageSize must be a number if passed").optional(),
}).meta({
  id: "GET /api/company/{companyId}/clients",
  route: "GET /api/company/{companyId}/clients",
});

export type ListClientsProps = z.infer<typeof ListClientsSchema>;

// Lists a company's clients. all_clients.read → every client; only
// assigned_clients.read → just the user's assigned clients.
export const listClients = async (props: ListClientsProps) => {
  try {
    ListClientsSchema.parse(props);

    const { userId, companyId } = props;

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

    const { clients, totalItems, totalPages } = await selectClients({
      ...props,
      assignedOnly: !canAll,
    });

    return {
      status: clients?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Clients fetched",
      clients,
      totalItems,
      totalPages,
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
      error = ["There was an error fetching the clients"],
    } = caught;

    throw { status, error };
  }
};
