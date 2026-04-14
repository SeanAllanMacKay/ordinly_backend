import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfile,
  CompanyProfileDocument,
} from "../schemas/index.js";

export const CompanyProfileDocumentRelations = relations(
  CompanyProfileDocument,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileDocument.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileDocument.createdBy],
      references: [User.id],
    }),
  }),
);
