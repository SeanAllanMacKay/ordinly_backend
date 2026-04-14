import { boolean, pgEnum, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { projectPermissionAction } from "../constants.js";
import { ProjectRole } from "./ProjectRole.js";

export const ProjectRolePermissionActionEnum = pgEnum(
  "project_permission_action",
  projectPermissionAction,
);

export const ProjectRolePermission = pgTable(
  "ProjectRolePermission",
  {
    id: uuid().primaryKey().defaultRandom(),
    roleId: uuid().references(() => ProjectRole.id),
    asset: ProjectRolePermissionActionEnum().notNull(),
    create: boolean().default(false).notNull(),
    read: boolean().default(false).notNull(),
    update: boolean().default(false).notNull(),
    delete: boolean().default(false).notNull(),
  },
  (table) => ({
    unq: unique().on(table.roleId, table.asset),
  }),
);
