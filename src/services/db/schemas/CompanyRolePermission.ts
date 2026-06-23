import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { CompanyRole } from "./CompanyRole.js";
import { CompanyPermission } from "./CompanyPermission.js";
import { CompanyPermissionLevel } from "./CompanyPermissionLevel.js";
import { User } from "./User.js";

// Assigns a level from the permission catalog to a role. The chosen level is
// referenced (not copied) — CompanyPermissionLevel is the source of truth for
// the granted CRUD, resolved via join when enforcing.
export const CompanyRolePermission = pgTable(
  "CompanyRolePermission",
  {
    id: uuid().primaryKey().defaultRandom(),
    roleId: uuid()
      .references(() => CompanyRole.id)
      .notNull(),
    permissionId: uuid()
      .references(() => CompanyPermission.id)
      .notNull(),
    levelId: uuid()
      .references(() => CompanyPermissionLevel.id)
      .notNull(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    unq: unique().on(table.roleId, table.permissionId),
  }),
);
