import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Company } from "./Company.js";
import { Client } from "./Client.js";
import { Document } from "./Document.js";

// An individual associated with a client (a point of contact). Free-form — not
// a platform User. Its phone numbers, emails and locations are attached
// polymorphically (ownerType: "contact"). `companyId` is carried for scoping.
export const Contact = pgTable(
  "Contact",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    clientId: uuid()
      .references(() => Client.id)
      .notNull(),
    name: text().notNull(),
    role: text(),
    description: text(),
    // Square WebP avatar variants under one Document (mirrors User.profilePicture).
    // Nullable — the FE falls back to initials when unset.
    profilePicture: uuid().references(() => Document.id),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    updatedDate: timestamp(),
    updatedBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    contactClientIdx: index("contact_client_idx").on(table.clientId),
  }),
);
