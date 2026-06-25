import { db, Reminder } from "../../index.js";

export type InsertReminderProps = {
  companyId: string;
  userId: string;
  title: string;
  body?: string;
  remindAt: Date;
  channels: string[];
  recipientUserIds: string[];
  targetType?: string;
  targetId?: string;
  recurrence?: string;
};

// Inserts a reminder in the "scheduled" state. The pg-boss job is enqueued
// separately by the caller, which then records its id via setReminderJobId; the
// reconcile scan is the safety net if that enqueue never lands.
export const insertReminder = async ({
  companyId,
  userId,
  title,
  body,
  remindAt,
  channels,
  recipientUserIds,
  targetType,
  targetId,
  recurrence,
}: InsertReminderProps) => {
  const [reminder] = await db
    .insert(Reminder)
    .values({
      companyId,
      title,
      body,
      remindAt,
      channels,
      recipientUserIds,
      targetType,
      targetId,
      recurrence,
      createdBy: userId,
    })
    .returning();

  return reminder;
};
