import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfileWebsite,
} from "../schemas/index.js";

export const CompanyProfileWebsiteRelations = relations(
  CompanyProfileWebsite,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileWebsite.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileWebsite.createdBy],
      references: [User.id],
    }),
  }),
);
