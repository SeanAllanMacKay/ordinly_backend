import { relations } from "drizzle-orm";
import { CompanySubscription, Company, User } from "../schemas/index.js";

export const CompanySubscriptionRelations = relations(
  CompanySubscription,
  ({ one }) => ({
    companyId: one(Company, {
      fields: [CompanySubscription.companyId],
      references: [Company.id],
    }),
    createdBy: one(User, {
      fields: [CompanySubscription.createdBy],
      references: [User.id],
    }),
    deletedBy: one(User, {
      fields: [CompanySubscription.deletedBy],
      references: [User.id],
    }),
  }),
);
