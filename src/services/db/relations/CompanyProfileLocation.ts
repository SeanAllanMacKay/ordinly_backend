import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfileLocation,
} from "../schemas/index.js";

export const CompanyProfileLocationRelations = relations(
  CompanyProfileLocation,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileLocation.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileLocation.createdBy],
      references: [User.id],
    }),
  }),
);
