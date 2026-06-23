import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { selectCompanyRoles } from "../../services/db/index.js";
import { assertCompanyPermission } from "../permissions/index.js";
import * as z from "zod";

const ListCompanyRolesSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
}).meta({ id: "GET /api/company/{companyId}/roles", route: "GET /api/company/{companyId}/roles" });

export type ListCompanyRolesProps = z.infer<typeof ListCompanyRolesSchema>;

// Lists the company's own roles plus the global system roles it can assign.
export const listCompanyRoles = async (props: ListCompanyRolesProps) => {
  try {
    ListCompanyRolesSchema.parse(props);

    const { userId, companyId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "roles",
      action: "read",
    });

    const roles = await selectCompanyRoles({ companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Roles fetched",
      roles,
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
      error = ["There was an error fetching the roles"],
    } = caught;

    throw { status, error };
  }
};
