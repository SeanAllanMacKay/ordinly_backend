import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { Team } from "./Team.js";
import { Project } from "./Project.js";
import { User } from "./User.js";

export const ProjectTeam = pgTable(
  "ProjectTeam",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    teamId: uuid()
      .references(() => Team.id)
      .notNull(),
    projectId: uuid()
      .references(() => Project.id)
      .notNull(),
    companyId: uuid().references(() => Company.id),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // One link row per (project, team) — makes re-linking idempotent.
    projectTeamUnique: unique("project_team_unique").on(
      table.projectId,
      table.teamId,
    ),
    projectTeamProjectIdx: index("project_team_project_idx").on(
      table.projectId,
    ),
    projectTeamTeamIdx: index("project_team_team_idx").on(table.teamId),
  }),
);
