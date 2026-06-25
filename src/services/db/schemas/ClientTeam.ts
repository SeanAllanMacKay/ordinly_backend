import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { Team } from "./Team.js";
import { Client } from "./Client.js";
import { User } from "./User.js";

export const ClientTeam = pgTable(
  "ClientTeam",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    teamId: uuid()
      .references(() => Team.id)
      .notNull(),
    clientId: uuid()
      .references(() => Client.id)
      .notNull(),
    companyId: uuid().references(() => Company.id),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // One link row per (client, team) — makes re-linking idempotent.
    clientTeamUnique: unique("client_team_unique").on(
      table.clientId,
      table.teamId,
    ),
    clientTeamClientIdx: index("client_team_client_idx").on(table.clientId),
    clientTeamTeamIdx: index("client_team_team_idx").on(table.teamId),
  }),
);
