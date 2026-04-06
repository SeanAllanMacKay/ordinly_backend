import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Document } from "./Document";
import { User } from "./User";
import { Project } from "./Project";

export const ProjectDocument = pgTable("ProjectDocument", {
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  documentId: uuid()
    .references(() => Document.id)
    .notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
