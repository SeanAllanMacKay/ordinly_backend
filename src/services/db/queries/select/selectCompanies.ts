import { eq, asc, or, count, and } from "drizzle-orm";

import { db, Company, UserCompany } from "../../";

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
    .where(or(eq(Company.owner, userId), eq(UserCompany.userId, userId)));

  const companies = await db.query.Company.findMany({
    where: (company, { exists }) =>
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
    orderBy: (company, { desc }) => desc(company.createdDate),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    companies,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};
