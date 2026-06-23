import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { ProjectRole } from "./ProjectRole.js";
import { ProjectPermission } from "./ProjectPermission.js";
import { ProjectPermissionLevel } from "./ProjectPermissionLevel.js";
import { User } from "./User.js";

// Assigns a level from the project permission catalog to a project role. See
// CompanyRolePermission for the reference-not-copy rationale.
export const ProjectRolePermission = pgTable(
  "ProjectRolePermission",
  {
    id: uuid().primaryKey().defaultRandom(),
    roleId: uuid()
      .references(() => ProjectRole.id)
      .notNull(),
    permissionId: uuid()
      .references(() => ProjectPermission.id)
      .notNull(),
    levelId: uuid()
      .references(() => ProjectPermissionLevel.id)
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
