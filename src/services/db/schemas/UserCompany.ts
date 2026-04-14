import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { sql } from "drizzle-orm";

export const UserCompany = pgTable(
  "UserCompany",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid()
      .references(() => User.id)
      .notNull(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    isPersonal: boolean().default(false).notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => {
    return {
      // Ensure each user has only one "personal" company
      uniquePersonalCompany: uniqueIndex("unique_personal_company")
        .on(table.userId)
        .where(sql`"isPersonal" = true`),
    };
  },
);
