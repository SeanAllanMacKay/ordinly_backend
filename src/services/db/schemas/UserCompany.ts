import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { User } from "./User";

export const UserCompany = pgTable("UserCompany", {
  userId: uuid()
    .references(() => User.id)
    .notNull(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),

  assignedDate: timestamp().defaultNow().notNull(),
  assignedBy: uuid()
    .references(() => User.id)
    .notNull(),
});
