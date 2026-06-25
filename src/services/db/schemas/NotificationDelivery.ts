import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { User } from "./User.js";

// Per-channel delivery attempt log. One row per (source, channel, recipient) —
// the unique index makes retries idempotent so a re-run of a fired reminder or
// a re-fired cron scan never double-sends. Each channel is recorded and retried
// independently, which is what lets the three channels work "in tandem" without
// being coupled: a push failure doesn't block the email, and vice versa.
export const NotificationDelivery = pgTable(
  "NotificationDelivery",
  {
    id: uuid().defaultRandom().unique().primaryKey(),

    sourceType: text().notNull(), // notificationSourceType: reminder | system
    // Reminder id, or a synthetic system key (e.g. "trial_half_over:<companyId>:<period>").
    sourceId: text().notNull(),

    channel: text().notNull(), // notificationChannel
    recipientUserId: uuid()
      .references(() => User.id)
      .notNull(),
    // The address/token resolved at send time (email or push token) — kept for audit.
    recipientAddress: text(),

    status: text().notNull().default("pending"), // deliveryStatus
    attempts: integer().notNull().default(0),
    lastError: text(),
    sentDate: timestamp(),

    createdDate: timestamp().defaultNow().notNull(),
    updatedDate: timestamp(),
  },
  (table) => ({
    deliveryUnique: uniqueIndex("delivery_source_channel_recipient_idx").on(
      table.sourceType,
      table.sourceId,
      table.channel,
      table.recipientUserId,
    ),
  }),
);
