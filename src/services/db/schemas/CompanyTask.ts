import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { Task } from "./Task.js";

export const CompanyTask = pgTable(
  "CompanyTask",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    taskId: uuid()
      .references(() => Task.id)
      .notNull(),

    assignedDate: timestamp().defaultNow().notNull(),
    assignedBy: uuid()
      .references(() => User.id)
      .notNull(),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    // A company can be subcontracted a given task only once
    companyTaskIndex: uniqueIndex("company_task_idx").on(
      table.companyId,
      table.taskId,
    ),
    // Reverse lookup: which companies are assigned this task
    companyTaskTaskIdx: index("company_task_task_idx").on(table.taskId),
  }),
);
