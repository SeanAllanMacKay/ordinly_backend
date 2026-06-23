import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

import { TaskStatus } from "./TaskStatus.js";
import { TaskPriority } from "./TaskPriority.js";
import { User } from "./User.js";
import { Project } from "./Project.js";
import { taskType } from "../constants.js";

export const TaskTypeEnum = pgEnum("task_type", taskType);

export const Task = pgTable("Task", {
  // Common
  id: uuid().defaultRandom().unique().primaryKey(),
  projectId: uuid()
    .references(() => Project.id)
    .notNull(),
  /**
   * Phases do not have parent tasks
   * Milestones and tasks may have a parent phase
   */
  parentTaskId: uuid().references((): AnyPgColumn => Task.id),
  type: TaskTypeEnum().default("task").notNull(),
  name: text().notNull(),
  description: text(),
  status: uuid().references(() => TaskStatus.id),
  priority: uuid().references(() => TaskPriority.id),
  dueDate: timestamp(),

  // Phase & Task
  startDate: timestamp(),

  // Milestone
  approver: uuid().references(() => User.id),
  isPaymentTrigger: boolean(),

  createdDate: timestamp().defaultNow().notNull(),
  updatedDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
