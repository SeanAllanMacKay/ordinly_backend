import { selectCompanies, SelectCompaniesProps } from "../../services/db";
import { HTTP_STATUSES } from "../HTTP_STATUSES";
import * as z from "zod";

const ListCompaniesSchema = z.object({
  userId: z.string("Invalid userId"),
  page: z.coerce.number("Page must be a number if passed").optional(),
  pageSize: z.coerce.number("pageSize must be a number if passed").optional(),
});

export const listCompanies = async (listCompanyProps: SelectCompaniesProps) => {
  try {
    ListCompaniesSchema.parse(listCompanyProps);

    const { companies, totalItems, totalPages } =
      await selectCompanies(listCompanyProps);

    return {
      status: companies?.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Companies fetched",
      companies,
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
      error = ["There was an error fetching your companies"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
