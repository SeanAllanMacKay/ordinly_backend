import { eq, asc, or, count, and } from "drizzle-orm";

import { db, Company, UserCompany } from "../../index.js";
import { getDownloadURI } from "../../../files/getDownloadURI.js";

export type SelectCompaniesProps = {
  userId: string;
  page?: number;
  pageSize?: number;
};

export const selectCompanies = async ({
  userId,
  page = 1,
  pageSize = 15,
}: SelectCompaniesProps) => {
  const [{ totalItems }] = await db
    .select({ totalItems: count() })
    .from(Company)
    .innerJoin(UserCompany, eq(Company.id, UserCompany.companyId))
    .where(
      and(
        eq(Company.isPersonal, false),
        or(eq(Company.owner, userId), eq(UserCompany.userId, userId)),
      ),
    );

  const companies = await db.query.Company.findMany({
    where: (company, { exists }) =>
      and(
        eq(Company.isPersonal, false),
        exists(
          db
            .select()
            .from(UserCompany)
            .where(
              and(
                eq(UserCompany.companyId, company.id),
                userId ? eq(UserCompany.userId, userId) : undefined,
              ),
            ),
        ),
      ),
    with: {
      logo: true,
    },
    orderBy: (company, { desc }) => desc(company.createdDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    companies: await Promise.all(
      companies.map(async (company) => ({
        ...company,
        logo: company.logo
          ? {
              ...company.logo,
              externalURL: await getDownloadURI({
                bucketName: process.env.BUCKET_NAME!,
                fileName: company.logo.name,
              }),
            }
          : undefined,
      })),
    ),
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
