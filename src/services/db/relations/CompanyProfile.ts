import { relations } from "drizzle-orm";
import {
  CompanyProfile,
  Company,
  CompanyProfileHoursOfOperation,
} from "../schemas/index.js";

export const CompanyProfileRelations = relations(
  CompanyProfile,
  ({ one, many }) => ({
    company: one(Company, {
      fields: [CompanyProfile.companyId],
      references: [Company.id],
    }),
    hoursOfOperation: one(CompanyProfileHoursOfOperation),
  }),
);
