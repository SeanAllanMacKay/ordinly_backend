import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfileHoursOfOperation,
} from "../schemas/index.js";

export const CompanyProfileHoursOfOperationRelations = relations(
  CompanyProfileHoursOfOperation,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileHoursOfOperation.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileHoursOfOperation.createdBy],
      references: [User.id],
    }),
  }),
);
