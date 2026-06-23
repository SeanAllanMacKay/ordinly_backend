import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { selectCompanyRole } from "../../services/db/index.js";
import { assertCompanyPermission } from "../permissions/index.js";
import * as z from "zod";

const GetCompanyRoleSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  roleId: z.string("Invalid roleId"),
});

export type GetCompanyRoleProps = z.infer<typeof GetCompanyRoleSchema>;

// Fetches a single role visible to the company (its own or a system role).
export const getCompanyRole = async (props: GetCompanyRoleProps) => {
  try {
    GetCompanyRoleSchema.parse(props);

    const { userId, companyId, roleId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "roles",
      action: "read",
    });

    const { exists, role } = await selectCompanyRole({ roleId, companyId });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Role not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Role fetched",
      role,
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
      error = ["There was an error fetching the role"],
    } = caught;

    throw { status, error };
  }
};
