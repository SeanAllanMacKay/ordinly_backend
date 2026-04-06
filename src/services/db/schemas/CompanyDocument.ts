import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { Document } from "./Document";
import { User } from "./User";

export const CompanyDocument = pgTable("CompanyDocument", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  documentId: uuid()
    .references(() => Document.id)
    .notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
