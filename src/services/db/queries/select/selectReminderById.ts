import { and, eq, isNull } from "drizzle-orm";

import { db, Reminder } from "../../index.js";

export type SelectReminderByIdProps = {
  reminderId: string;
  companyId?: string;
};

// Fetches a single non-deleted reminder. Pass `companyId` to enforce company
// scoping in request paths; omit it for internal worker lookups by id.
export const selectReminderById = async ({
  reminderId,
  companyId,
}: SelectReminderByIdProps) => {
  return db.query.Reminder.findFirst({
    where: and(
      eq(Reminder.id, reminderId),
      companyId ? eq(Reminder.companyId, companyId) : undefined,
      isNull(Reminder.deletedDate),
    ),
  });
};
