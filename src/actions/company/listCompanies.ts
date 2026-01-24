import { Company } from "../../services/database";

type GetCompanyProps = {
  userId: string;
  page: number;
};

const PAGE_SIZE = 15;

export const listCompanies = async ({ userId, page }: GetCompanyProps) => {
  try {
    const [
      {
        companies,
        info: [{ total } = { total: 0 }],
      },
    ] = await Company.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          $and: [
            {
              workers: {
                $elemMatch: {
                  userId: userId.toString(),
                  status: { $nin: ["pending", "inactive"] },
                },
              },
            },
            { deletedAt: { $exists: false } },
          ],
        },
      },
      {
        $facet: {
          companies: [
            { $skip: (Number(page) - 1) * PAGE_SIZE },
            { $limit: PAGE_SIZE },
          ],
          info: [{ $count: "total" }],
        },
      },
    ]);

    if (!companies) {
      throw { status: 404, error: "Companies not found" };
    }

    return {
      status: 200,
      message: "Companies fetched",
      companies,
      totalItems: total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (caught: any) {
    console.log(caught);
    const {
      status = 500,
      error = "There was an error fetching your companies",
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
