import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { Team } from "./Team.js";
import { Task } from "./Task.js";
import { User } from "./User.js";

// Team links for tasks. Serves both tasks and phases — both are Task rows.
export const TaskTeam = pgTable(
  "TaskTeam",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    teamId: uuid()
      .references(() => Team.id)
      .notNull(),
    taskId: uuid()
      .references(() => Task.id)
      .notNull(),
    companyId: uuid().references(() => Company.id),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // One link row per (task, team) — makes re-linking idempotent.
    taskTeamUnique: unique("task_team_unique").on(table.taskId, table.teamId),
    taskTeamTaskIdx: index("task_team_task_idx").on(table.taskId),
    taskTeamTeamIdx: index("task_team_team_idx").on(table.teamId),
  }),
);
