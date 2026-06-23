import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { Project } from "./Project.js";
// The "location_type" pg enum is declared once on the canonical Location table.
import { LocationTypeEnum } from "./Location.js";

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
