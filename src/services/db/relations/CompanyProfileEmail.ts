import { relations } from "drizzle-orm";
import { User, CompanyProfile, CompanyProfileEmail } from "../schemas/index.js";

export const CompanyProfileEmailRelations = relations(
  CompanyProfileEmail,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileEmail.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileEmail.createdBy],
      references: [User.id],
    }),
  }),
);
