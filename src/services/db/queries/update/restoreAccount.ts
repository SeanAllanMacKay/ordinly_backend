import { and, eq } from "drizzle-orm";

import {
  db,
  User,
  Company,
  Project,
  Task,
  TaskChecklistItem,
  Client,
  Contact,
  PhoneNumber,
  EmailAddress,
  Location,
  Reminder,
  Team,
  TeamMember,
  CompanyRole,
  CompanySubscription,
  Notification,
  UserCompany,
  UserCompanyRole,
} from "../../index.js";

export type RestoreAccountProps = {
  userId: string;
  deletedAt: Date;
};

// Tables stamped by softDeleteAccount with (deletedBy = userId, deletedDate =
// deletedAt). Restoring is the exact inverse: clear those two columns on rows
// matching the batch key, so only the rows this deletion touched come back.
const BATCH_TABLES: any[] = [
  Company,
  Project,
  Task,
  TaskChecklistItem,
  Client,
  Contact,
  PhoneNumber,
  EmailAddress,
  Location,
  Reminder,
  Team,
  TeamMember,
  CompanyRole,
  CompanySubscription,
  Notification,
  UserCompany,
  UserCompanyRole,
];

/**
 * Reverse a soft-deleted account within the grace window. Clears the batch key
 * on every owned entity and revives the user row. Matches softDeleteAccount's
 * stamping exactly, keyed by the shared `deletedAt` timestamp.
 */
export const restoreAccount = async ({
  userId,
  deletedAt,
}: RestoreAccountProps) => {
  return await db.transaction(async (tx) => {
    for (const table of BATCH_TABLES as any[]) {
      await tx
        .update(table)
        .set({ deletedDate: null, deletedBy: null })
        .where(
          and(eq(table.deletedBy, userId), eq(table.deletedDate, deletedAt)),
        );
    }

    // The user row has no deletedBy; also clear the scheduled hard-delete job id.
    const [user] = await tx
      .update(User)
      .set({ deletedDate: null, hardDeleteJobId: null })
      .where(eq(User.id, userId))
      .returning();

    return user;
  });
};
