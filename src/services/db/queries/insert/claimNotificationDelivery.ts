import { and, eq, sql } from "drizzle-orm";

import { db, NotificationDelivery } from "../../index.js";

export type ClaimNotificationDeliveryProps = {
  sourceType: string;
  sourceId: string;
  channel: string;
  recipientUserId: string;
  recipientAddress?: string;
};

// Idempotently claims the delivery row for a (source, channel, recipient) and
// bumps its attempt counter. The unique index makes this safe under retries and
// re-fired scans: the first call inserts, every later call updates the same row.
// Returns the row plus whether it was already sent, so the caller can skip
// re-sending an already-delivered message.
export const claimNotificationDelivery = async ({
  sourceType,
  sourceId,
  channel,
  recipientUserId,
  recipientAddress,
}: ClaimNotificationDeliveryProps) => {
  const [delivery] = await db
    .insert(NotificationDelivery)
    .values({
      sourceType,
      sourceId,
      channel,
      recipientUserId,
      recipientAddress,
      status: "pending",
      attempts: 1,
    })
    .onConflictDoUpdate({
      target: [
        NotificationDelivery.sourceType,
        NotificationDelivery.sourceId,
        NotificationDelivery.channel,
        NotificationDelivery.recipientUserId,
      ],
      set: {
        attempts: sql`${NotificationDelivery.attempts} + 1`,
        recipientAddress,
        updatedDate: new Date(),
      },
    })
    .returning();

  const alreadySent = delivery.status === "sent";

  return { delivery, alreadySent };
};

export type MarkDeliveryResultProps = {
  deliveryId: string;
  status: "sent" | "failed";
  error?: string;
};

// Records the outcome of a delivery attempt.
export const markDeliveryResult = async ({
  deliveryId,
  status,
  error,
}: MarkDeliveryResultProps) => {
  await db
    .update(NotificationDelivery)
    .set({
      status,
      lastError: error ?? null,
      sentDate: status === "sent" ? new Date() : null,
      updatedDate: new Date(),
    })
    .where(eq(NotificationDelivery.id, deliveryId));
};
