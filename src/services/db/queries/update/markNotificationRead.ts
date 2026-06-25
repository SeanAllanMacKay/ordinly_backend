import { and, eq, isNull } from "drizzle-orm";

import { db, Notification } from "../../index.js";

// Marks one of a user's in-app notifications as read. Scoped to the recipient so
// a user can only read-receipt their own. Returns the row, or undefined.
export const markNotificationRead = async ({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) => {
  const [notification] = await db
    .update(Notification)
    .set({ readDate: new Date() })
    .where(
      and(
        eq(Notification.id, notificationId),
        eq(Notification.userId, userId),
        isNull(Notification.deletedDate),
      ),
    )
    .returning();

  return notification;
};
