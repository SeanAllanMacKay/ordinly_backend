import { and, eq, isNull, or } from "drizzle-orm";

import { db, Company, UserCompany } from "../../index.js";
import { fileService } from "../../../files/index.js";

export type SelectCompanyProps = {
  userId: string;
  companyId: string;
};

// Single non-deleted company the user owns or is a member of, with its logo and
// profile relations. Unlike selectCompanies (the list), this serves personal
// companies too. Returns undefined when the company doesn't exist or the user
// has no access — the access gate for the single-company GET.
export const selectCompany = async ({
  userId,
  companyId,
}: SelectCompanyProps) => {
  const company = await db.query.Company.findFirst({
    where: (company, { exists }) =>
      and(
        eq(company.id, companyId),
        isNull(company.deletedDate),
        or(
          eq(company.owner, userId),
          exists(
            db
              .select()
              .from(UserCompany)
              .where(
                and(
                  eq(UserCompany.companyId, company.id),
                  eq(UserCompany.userId, userId),
                  isNull(UserCompany.deletedDate),
                ),
              ),
          ),
        ),
      ),
    with: {
      logo: true,
      profile: true,
    },
  });

  if (!company) return undefined;

  const { logo, ...rest } = company;

  return {
    ...rest,
    // Public, immutable variant URL map (or null) the FE renders via srcset.
    logo: await fileService.buildCompanyLogoURLs(logo?.externalPath),
  };
};
