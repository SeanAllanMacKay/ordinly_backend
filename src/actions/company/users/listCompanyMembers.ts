import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectCompanyMembers } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListCompanyMembersSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  page: z.coerce.number().int().positive().optional(),
}).meta({ id: "GET /api/company/{companyId}/users", route: "GET /api/company/{companyId}/users" });

export type ListCompanyMembersProps = z.infer<typeof ListCompanyMembersSchema>;

// Lists a company's members (paginated) with their assigned roles.
export const listCompanyMembers = async (props: ListCompanyMembersProps) => {
  try {
    ListCompanyMembersSchema.parse(props);

    const { userId, companyId, page } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "read",
    });

    const { members, totalItems, totalPages } = await selectCompanyMembers({
      companyId,
      page,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Members fetched",
      members,
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
      error = ["There was an error fetching the members"],
    } = caught;

    throw { status, error };
  }
};
