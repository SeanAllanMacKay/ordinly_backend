import { and, desc, eq, isNull } from "drizzle-orm";

import { db, Reminder } from "../../index.js";

export type SelectRemindersProps = {
  companyId: string;
  createdBy?: string;
};

// Lists a company's active (non-deleted) reminders, newest-scheduled first.
// Pass `createdBy` to scope to a single user's own reminders.
export const selectReminders = async ({
  companyId,
  createdBy,
}: SelectRemindersProps) => {
  return db.query.Reminder.findMany({
    where: and(
      eq(Reminder.companyId, companyId),
      createdBy ? eq(Reminder.createdBy, createdBy) : undefined,
      isNull(Reminder.deletedDate),
    ),
    orderBy: desc(Reminder.remindAt),
  });
};
