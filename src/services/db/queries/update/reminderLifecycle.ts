import { and, eq, isNull } from "drizzle-orm";

import { db, Reminder } from "../../index.js";

// Records the pg-boss job id after the reminder has been enqueued. Internal —
// not company-scoped (called right after insert by the same flow).
export const setReminderJobId = async ({
  reminderId,
  jobId,
}: {
  reminderId: string;
  jobId: string;
}) => {
  await db
    .update(Reminder)
    .set({ jobId, updatedDate: new Date() })
    .where(eq(Reminder.id, reminderId));
};

// Marks a reminder as fired once its dispatch has been handed off. Only moves
// rows still in "scheduled" so a recurring reminder isn't terminated.
export const markReminderFired = async ({
  reminderId,
  recurring = false,
}: {
  reminderId: string;
  recurring?: boolean;
}) => {
  await db
    .update(Reminder)
    .set({
      status: recurring ? "scheduled" : "fired",
      firedDate: new Date(),
      updatedDate: new Date(),
    })
    .where(
      and(eq(Reminder.id, reminderId), eq(Reminder.status, "scheduled")),
    );
};

// Soft-cancels a reminder (company-scoped). Returns the row, or undefined if it
// wasn't found / already gone. The caller cancels the pg-boss job separately.
export const cancelReminder = async ({
  reminderId,
  companyId,
  userId,
}: {
  reminderId: string;
  companyId: string;
  userId: string;
}) => {
  const [reminder] = await db
    .update(Reminder)
    .set({
      status: "cancelled",
      deletedDate: new Date(),
      deletedBy: userId,
    })
    .where(
      and(
        eq(Reminder.id, reminderId),
        eq(Reminder.companyId, companyId),
        isNull(Reminder.deletedDate),
      ),
    )
    .returning();

  return reminder;
};
