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

// An in-app notification — the feed the frontend fetches and badges. Written by
// the in_app delivery channel when a reminder/system notification fires. This
// is intentionally separate from the email/push channels: a user might receive
// an in-app entry, an email, both, or neither, all from the same trigger.
export const Notification = pgTable(
  "Notification",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    userId: uuid()
      .references(() => User.id)
      .notNull(), // recipient

    type: text().notNull(), // e.g. "reminder", "trial_half_over"
    title: text().notNull(),
    body: text(),
    data: jsonb().$type<Record<string, unknown>>(),

    readDate: timestamp(),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid().references(() => User.id),
    deletedDate: timestamp(),
    deletedBy: uuid().references(() => User.id),
  },
  (table) => ({
    // Unread-feed lookups for a recipient.
    notificationUserIdx: index("notification_user_idx").on(
      table.userId,
      table.readDate,
    ),
  }),
);
