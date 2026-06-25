import { and, desc, eq, isNull } from "drizzle-orm";

import { db, Notification } from "../../index.js";

export type SelectNotificationsProps = {
  userId: string;
  companyId: string;
  unreadOnly?: boolean;
  limit?: number;
};

// The in-app feed for a recipient within a company, newest first. `unreadOnly`
// backs the badge count.
export const selectNotifications = async ({
  userId,
  companyId,
  unreadOnly,
  limit = 50,
}: SelectNotificationsProps) => {
  return db.query.Notification.findMany({
    where: and(
      eq(Notification.userId, userId),
      eq(Notification.companyId, companyId),
      unreadOnly ? isNull(Notification.readDate) : undefined,
      isNull(Notification.deletedDate),
    ),
    orderBy: desc(Notification.createdDate),
    limit,
  });
};
