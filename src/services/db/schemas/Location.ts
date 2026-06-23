import { pgTable, uuid, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { locationType, ownerType } from "../constants.js";
import { User } from "./User.js";

export const LocationTypeEnum = pgEnum("location_type", locationType);

// Polymorphic location attached to any owner (client, contact, …) via
// `ownerType` + `ownerId`. Carries both a postal address and optional geo
// coordinates; only `address` is required.
export const Location = pgTable(
  "Location",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    ownerType: text({ enum: ownerType }).notNull(),
    ownerId: uuid().notNull(),

    name: text(),
    address: text().notNull(),
    zoneIdentifier: text(),
    city: text(),
    region: text(),
    country: text(),
    type: LocationTypeEnum(),
    latitude: text(),
    longitude: text(),
    description: text(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    locationOwnerIdx: index("location_owner_idx").on(
      table.ownerType,
      table.ownerId,
    ),
  }),
);

export type LocationType = typeof Location.$inferSelect;
