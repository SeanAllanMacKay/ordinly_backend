import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { ownerType } from "../constants.js";
import { User } from "./User.js";

// Polymorphic phone number attached to any owner (client, contact, …) via
// `ownerType` + `ownerId`. `type` is free text (mobile, work, …).
export const PhoneNumber = pgTable(
  "PhoneNumber",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    ownerType: text({ enum: ownerType }).notNull(),
    ownerId: uuid().notNull(),

    number: text().notNull(),
    type: text(),
    description: text(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    phoneNumberOwnerIdx: index("phone_number_owner_idx").on(
      table.ownerType,
      table.ownerId,
    ),
  }),
);
