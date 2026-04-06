import { insertCompany, InsertCompanyProps } from "../../services/db";
import { HTTP_STATUSES } from "../HTTP_STATUSES";
import * as z from "zod";

const CreateCompanySchema = z.object({
  userId: z.string("Invalid userId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
});

export const createCompany = async (companyProps: InsertCompanyProps) => {
  try {
    CreateCompanySchema.parse(companyProps);

    const newCompany = await insertCompany(companyProps);

    return {
      status: HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Company successfully created",
      companyId: newCompany.id,
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
      error = ["There was an error creating this company"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
