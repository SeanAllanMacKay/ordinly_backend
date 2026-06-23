import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  unique,
  index,
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
      // One membership row per (user, company); also the FK target for
      // UserProject/UserTask so workers can only be assigned under a company
      // they actually belong to.
      userCompanyUnique: unique("user_company_unique").on(
        table.userId,
        table.companyId,
      ),
      // Reverse lookup: all members of a company
      userCompanyCompanyIdx: index("user_company_company_idx").on(
        table.companyId,
      ),
    };
  },
);
