import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { Project } from "./Project.js";
import { locationType } from "../constants.js";

export const LocationTypeEnum = pgEnum("location_type", locationType);

export const ProjectLocation = pgTable("ProjectLocation", {
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull()
    .unique(),
  name: text(),
  type: LocationTypeEnum().notNull(),
  latitude: text().notNull(),
  longitude: text().notNull(),
});
