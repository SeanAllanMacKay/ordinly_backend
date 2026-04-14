import { relations } from "drizzle-orm";
import {
  User,
  CompanyProfileAlbumImage,
  Document,
  CompanyProfileAlbum,
} from "../schemas/index.js";

export const CompanyProfileAlbumImageRelations = relations(
  CompanyProfileAlbumImage,
  ({ one }) => ({
    companyProfileAlbumId: one(CompanyProfileAlbum, {
      fields: [CompanyProfileAlbumImage.companyProfileAlbumId],
      references: [CompanyProfileAlbum.id],
    }),
    image: one(Document, {
      fields: [CompanyProfileAlbumImage.image],
      references: [Document.id],
    }),
    createdBy: one(User, {
      fields: [CompanyProfileAlbumImage.createdBy],
      references: [User.id],
    }),
  }),
);
