import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { CompanyPermission } from "./CompanyPermission.js";

// The selectable levels for a CompanyPermission (None / View / Edit / Full
// Control, etc). Each level is the single source of truth for the CRUD it
// grants — the level set and the CRUD mapping differ per permission.
export const CompanyPermissionLevel = pgTable(
  "CompanyPermissionLevel",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    permissionId: uuid()
      .references(() => CompanyPermission.id)
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
