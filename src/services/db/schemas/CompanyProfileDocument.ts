import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";
import { Document } from "./Document.js";

export const CompanyProfileDocument = pgTable("CompanyProfileDocument", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyProfileId: uuid()
    .references(() => CompanyProfile.id)
    .notNull(),
  documentId: uuid()
    .references(() => Document.id)
    .notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
