import { and, eq, gte, isNull, lt } from "drizzle-orm";

import { db, Company, CompanySubscription, User } from "../../index.js";

export type SelectCompaniesForTrialMilestoneProps = {
  // Inclusive lower / exclusive upper bound on Company.createdDate.
  createdFrom: Date;
  createdTo: Date;
};

// Real (non-personal, non-deleted) companies whose createdDate falls in a
// window, with the owner's contact info and whether they hold an active
// subscription. The trial scan derives the window from a milestone offset, so
// each daily run targets exactly the companies crossing that milestone today.
export const selectCompaniesForTrialMilestone = async ({
  createdFrom,
  createdTo,
}: SelectCompaniesForTrialMilestoneProps) => {
  const rows = await db
    .select({
      companyId: Company.id,
      companyName: Company.name,
      ownerId: User.id,
      ownerEmail: User.email,
      ownerName: User.name,
      subscriptionActive: CompanySubscription.isActive,
    })
    .from(Company)
    .innerJoin(User, eq(User.id, Company.owner))
    .leftJoin(
      CompanySubscription,
      and(
        eq(CompanySubscription.companyId, Company.id),
        eq(CompanySubscription.isActive, true),
        isNull(CompanySubscription.deletedDate),
      ),
    )
    .where(
      and(
        eq(Company.isPersonal, false),
        isNull(Company.deletedDate),
        gte(Company.createdDate, createdFrom),
        lt(Company.createdDate, createdTo),
      ),
    );

  return rows.map((row) => ({
    ...row,
    hasActiveSubscription: Boolean(row.subscriptionActive),
  }));
};
