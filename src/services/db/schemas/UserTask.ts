import { pgTable, uuid, timestamp, foreignKey, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Task } from "./Task.js";
import { UserCompany } from "./UserCompany.js";

export const UserTask = pgTable(
  "UserTask",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    userId: uuid()
      .references(() => User.id)
      .notNull(),
    taskId: uuid()
      .references(() => Task.id)
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
      name: "user_task_user_company_fk",
    }),
    userTaskUserIdx: index("user_task_user_idx").on(table.userId),
    userTaskTaskIdx: index("user_task_task_idx").on(table.taskId),
    userTaskCompanyIdx: index("user_task_company_idx").on(table.companyId),
  }),
);
