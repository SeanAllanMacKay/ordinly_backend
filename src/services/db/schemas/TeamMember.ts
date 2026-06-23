import {
  pgTable,
  uuid,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { Team } from "./Team.js";
import { User } from "./User.js";

export const TeamMember = pgTable(
  "TeamMember",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    teamId: uuid()
      .references(() => Team.id)
      .notNull(),
    userId: uuid()
      .references(() => User.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    // One membership row per (team, user)
    teamMemberUnique: unique("team_member_unique").on(
      table.teamId,
      table.userId,
    ),
    teamMemberTeamIdx: index("team_member_team_idx").on(table.teamId),
    teamMemberUserIdx: index("team_member_user_idx").on(table.userId),
  }),
);
