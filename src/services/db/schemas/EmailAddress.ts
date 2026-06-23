import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { ownerType } from "../constants.js";
import { User } from "./User.js";

// Polymorphic email address attached to any owner (client, contact, …) via
// `ownerType` + `ownerId`. `type` is free text (work, personal, …).
export const EmailAddress = pgTable(
  "EmailAddress",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    ownerType: text({ enum: ownerType }).notNull(),
    ownerId: uuid().notNull(),

    email: text().notNull(),
    type: text(),
    description: text(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    emailAddressOwnerIdx: index("email_address_owner_idx").on(
      table.ownerType,
      table.ownerId,
    ),
  }),
);
