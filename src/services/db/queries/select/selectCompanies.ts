import { eq, or, count, and, isNull } from "drizzle-orm";

import { db, Company, UserCompany } from "../../index.js";
import { fileService } from "../../../files/index.js";

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
        isNull(Company.deletedDate),
        or(eq(Company.owner, userId), eq(UserCompany.userId, userId)),
      ),
    );

  const companies = await db.query.Company.findMany({
    where: (company, { exists }) =>
      and(
        eq(Company.isPersonal, false),
        isNull(Company.deletedDate),
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
      profile: true,
    },
    orderBy: (company, { desc }) => desc(company.createdDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    companies: await Promise.all(
      companies.map(async ({ logo, ...company }) => ({
        ...company,
        // Public, immutable variant URL map (or null) the FE renders via srcset.
        logo: await fileService.buildCompanyLogoURLs(logo?.externalPath),
      })),
    ),
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
