import { selectCompany, SelectCompanyProps } from "../../services/db/index.js";
import { buildCompanyPermissionFlags } from "../permissions/index.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import * as z from "zod";

const GetCompanySchema = z
  .object({
    userId: z.string("Invalid userId"),
    companyId: z.string("Invalid companyId"),
  })
  .meta({
    id: "GET /api/company/:companyId",
    route: "GET /api/company/:companyId",
  });

export const getCompany = async (getCompanyProps: SelectCompanyProps) => {
  try {
    GetCompanySchema.parse(getCompanyProps);

    const { userId, companyId } = getCompanyProps;

    const company = await selectCompany({ userId, companyId });

    if (!company) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Company not found"],
      };
    }

    // Flat `${key}:${action}` permission map for the FE (all keys always
    // present; owners get every flag). Access was already gated by selectCompany.
    const { isOwner, permissions } = await buildCompanyPermissionFlags({
      userId,
      companyId,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Company fetched",
      company: { ...company, isOwner },
      permissions,
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
      error = ["There was an error fetching this company"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
