import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";

// A user-created reminder. The reminder is the durable source of truth for
// "notify these people at this time"; the actual firing is driven by a pg-boss
// job (id stored on `jobId`) so it survives restarts/deploys. When it fires the
// dispatch layer fans out to `channels` for each of `recipientUserIds`.
//
// `targetType` + `targetId` optionally tie the reminder to a domain entity
// (client/contact/project/task/company) — the same polymorphic pattern used by
// PhoneNumber/EmailAddress/Location.
export const Reminder = pgTable(
  "Reminder",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),

    targetType: text(), // reminderTargetType
    targetId: uuid(),

    title: text().notNull(),
    body: text(),

    remindAt: timestamp().notNull(),
    // Subset of notificationChannel to deliver on.
    channels: jsonb().$type<string[]>().notNull(),
    // Company users to notify (defaults to just the creator).
    recipientUserIds: jsonb().$type<string[]>().notNull(),
    // Optional cron expression — set for recurring reminders.
    recurrence: text(),

    status: text().notNull().default("scheduled"), // reminderStatus
    jobId: text(), // pg-boss job id, for cancel/reschedule
    firedDate: timestamp(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    updatedDate: timestamp(),
    updatedBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    reminderCompanyIdx: index("reminder_company_idx").on(table.companyId),
    // Drives the reconcile scan: find scheduled reminders that are due.
    reminderDueIdx: index("reminder_due_idx").on(table.status, table.remindAt),
  }),
);
