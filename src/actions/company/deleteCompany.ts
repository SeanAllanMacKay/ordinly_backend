import {
  deleteCompany as deleteCompanyQuery,
  DeleteCompanyProps,
} from "../../services/db/index.js";
import {
  assertCompanyOwner,
  assertNotPersonalCompany,
} from "../permissions/index.js";
import * as z from "zod";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

const DeleteCompanySchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
});

export const deleteCompany = async (deleteCompanyProps: DeleteCompanyProps) => {
  try {
    DeleteCompanySchema.parse(deleteCompanyProps);

    const { userId, companyId } = deleteCompanyProps;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyOwner({ userId, companyId });

    const company = await deleteCompanyQuery(deleteCompanyProps);

    if (!company) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Company not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Company deleted",
      company,
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
      error = ["There was an error deleting this company"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
