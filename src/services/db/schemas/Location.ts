import { pgTable, uuid, text, pgEnum } from "drizzle-orm/pg-core";
import { locationType } from "../constants.js";

export const LocationTypeEnum = pgEnum("location_type", locationType);

export const Location = pgTable("Location", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text(),
  type: LocationTypeEnum().notNull(),
  latitude: text().notNull(),
  longitude: text().notNull(),
});

export type LocationType = typeof Location.$inferSelect;
