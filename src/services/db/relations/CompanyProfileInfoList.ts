import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfileInfoList,
} from "../schemas/index.js";

export const CompanyProfileInfoListRelations = relations(
  CompanyProfileInfoList,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileInfoList.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileInfoList.createdBy],
      references: [User.id],
    }),
  }),
);
