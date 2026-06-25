import { pgTable, uuid, timestamp, foreignKey, index, unique } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Client } from "./Client.js";
import { UserCompany } from "./UserCompany.js";

export const UserClient = pgTable(
  "UserClient",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    userId: uuid()
      .references(() => User.id)
      .notNull(),
    clientId: uuid()
      .references(() => Client.id)
      .notNull(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // A worker can only be assigned under a company they're a member of
    userCompanyFk: foreignKey({
      columns: [table.userId, table.companyId],
      foreignColumns: [UserCompany.userId, UserCompany.companyId],
      name: "user_client_user_company_fk",
    }),
    // One link row per (client, user) — makes re-linking idempotent.
    userClientUnique: unique("user_client_unique").on(
      table.clientId,
      table.userId,
    ),
    userClientUserIdx: index("user_client_user_idx").on(table.userId),
    userClientClientIdx: index("user_client_client_idx").on(table.clientId),
    userClientCompanyIdx: index("user_client_company_idx").on(table.companyId),
  }),
);
