import { db, Notification } from "../../index.js";

export type InsertNotificationProps = {
  companyId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
};

// Writes a single in-app feed entry (the in_app delivery channel).
export const insertNotification = async ({
  companyId,
  userId,
  type,
  title,
  body,
  data,
}: InsertNotificationProps) => {
  const [notification] = await db
    .insert(Notification)
    .values({ companyId, userId, type, title, body, data })
    .returning();

  return notification;
};
