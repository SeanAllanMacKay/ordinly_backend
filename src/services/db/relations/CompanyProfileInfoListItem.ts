import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfileAlbum,
  CompanyProfileInfoListItem,
} from "../schemas/index.js";

export const CompanyProfileInfoListItemRelations = relations(
  CompanyProfileInfoListItem,
  ({ one }) => ({
    companyProfileAlbumId: one(CompanyProfileAlbum, {
      fields: [CompanyProfileInfoListItem.companyProfilInfoListId],
      references: [CompanyProfileAlbum.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileInfoListItem.createdBy],
      references: [User.id],
    }),
  }),
);
