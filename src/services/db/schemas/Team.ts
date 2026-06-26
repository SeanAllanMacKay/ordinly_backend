import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Company } from "./Company.js";
import { Document } from "./Document.js";

export const Team = pgTable("Team", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  name: text().notNull(),
  description: text(),
  // Square WebP avatar variants under one Document (mirrors User.profilePicture).
  // Nullable — the FE falls back to initials when unset.
  profilePicture: uuid().references(() => Document.id),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid().references(() => User.id),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
