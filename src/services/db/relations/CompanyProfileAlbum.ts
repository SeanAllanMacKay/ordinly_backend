import { relations } from "drizzle-orm";
import { User, CompanyProfileAlbum, CompanyProfile } from "../schemas/index.js";

export const CompanyProfileAlbumRelations = relations(
  CompanyProfileAlbum,
  ({ one }) => ({
    companyProfile: one(CompanyProfile, {
      fields: [CompanyProfileAlbum.companyProfileId],
      references: [CompanyProfile.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileAlbum.createdBy],
      references: [User.id],
    }),
  }),
);
