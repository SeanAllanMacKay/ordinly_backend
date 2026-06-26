import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Document } from "./Document.js";

export const Client = pgTable("Client", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text(),
  description: text(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  clientCompanyId: uuid().references(() => Company.id),
  clientUserId: uuid().references(() => User.id),
  // Square WebP avatar variants under one Document (mirrors User.profilePicture).
  // Nullable — the FE falls back to initials when unset.
  profilePicture: uuid().references(() => Document.id),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  updatedDate: timestamp(),
  updatedBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
