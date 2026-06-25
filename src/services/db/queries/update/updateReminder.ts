import { and, eq, isNull } from "drizzle-orm";

import { db, Reminder } from "../../index.js";

export type UpdateReminderProps = {
  reminderId: string;
  companyId: string;
  userId: string;
  title?: string;
  body?: string;
  remindAt?: Date;
  channels?: string[];
  recipientUserIds?: string[];
  targetType?: string;
  targetId?: string;
  // Cleared/replaced by the caller when the schedule changes.
  jobId?: string | null;
};

// Updates a reminder's editable fields, company-scoped. Returns the updated row,
// or undefined if it isn't in the company / is already deleted. Rescheduling
// (cancel old job + enqueue new) is orchestrated in the action layer.
export const updateReminder = async ({
  reminderId,
  companyId,
  userId,
  title,
  body,
  remindAt,
  channels,
  recipientUserIds,
  targetType,
  targetId,
  jobId,
}: UpdateReminderProps) => {
  const [reminder] = await db
    .update(Reminder)
    .set({
      title,
      body,
      remindAt,
      channels,
      recipientUserIds,
      targetType,
      targetId,
      jobId,
      updatedDate: new Date(),
      updatedBy: userId,
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
