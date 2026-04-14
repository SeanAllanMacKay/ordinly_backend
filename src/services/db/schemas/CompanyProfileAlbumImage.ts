import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfileAlbum } from "./CompanyProfileAlbum.js";
import { CompanyDocument } from "./CompanyDocument.js";

export const CompanyProfileAlbumImage = pgTable("CompanyProfileAlbumImage", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileAlbumId: uuid()
    .references(() => CompanyProfileAlbum.id)
    .notNull(),
  image: uuid()
    .references(() => CompanyDocument.id)
    .notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
