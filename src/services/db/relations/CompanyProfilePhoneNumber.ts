import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfilePhoneNumber,
} from "../schemas/index.js";

export const CompanyProfilePhoneNumberRelations = relations(
  CompanyProfilePhoneNumber,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfilePhoneNumber.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfilePhoneNumber.createdBy],
      references: [User.id],
    }),
  }),
);
