import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { ProjectPermission } from "./ProjectPermission.js";

// The selectable levels for a ProjectPermission. See CompanyPermissionLevel.
export const ProjectPermissionLevel = pgTable(
  "ProjectPermissionLevel",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    permissionId: uuid()
      .references(() => ProjectPermission.id)
      .notNull(),
    value: text().notNull(),
    name: text().notNull(),
    description: text().notNull(),
    create: boolean().default(false).notNull(),
    read: boolean().default(false).notNull(),
    update: boolean().default(false).notNull(),
    delete: boolean().default(false).notNull(),
    sortOrder: integer().default(0).notNull(),

    createdDate: timestamp().defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.permissionId, table.value),
  }),
);
