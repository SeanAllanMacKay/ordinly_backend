import { and, eq, isNull, lte } from "drizzle-orm";

import { db, Reminder } from "../../index.js";

export type SelectDueRemindersProps = {
  before?: Date;
  limit?: number;
};

// Scheduled reminders whose time has arrived. Used by the reconcile scan to
// re-enqueue anything whose pg-boss job was lost (e.g. enqueue failed after the
// row committed). Dispatch is idempotent, so re-enqueuing is always safe.
export const selectDueReminders = async ({
  before = new Date(),
  limit = 500,
}: SelectDueRemindersProps = {}) => {
  return db.query.Reminder.findMany({
    where: and(
      eq(Reminder.status, "scheduled"),
      lte(Reminder.remindAt, before),
      isNull(Reminder.deletedDate),
    ),
    limit,
  });
};
