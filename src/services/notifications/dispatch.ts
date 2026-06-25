import {
  claimNotificationDelivery,
  markDeliveryResult,
  selectUsersByIds,
} from "../db/index.js";

import { sendEmailChannel } from "./channels/email.js";
import { sendInAppChannel } from "./channels/inApp.js";
import { sendPushChannel } from "./channels/push.js";
import type {
  ChannelArgs,
  ChannelResult,
  NotificationContent,
} from "./channels/types.js";

export type DispatchSource = {
  // notificationSourceType: "reminder" | "system"
  type: string;
  // Reminder id, or a synthetic system key (e.g. "trial_half_over:<companyId>:<period>").
  id: string;
};

export type DispatchProps = {
  companyId: string;
  source: DispatchSource;
  recipientUserIds: string[];
  channels: string[];
  content: NotificationContent;
};

const CHANNELS: Record<
  string,
  (args: ChannelArgs) => Promise<ChannelResult>
> = {
  email: sendEmailChannel,
  in_app: sendInAppChannel,
  push: sendPushChannel,
};

/**
 * Fan a single notification out to every requested channel for every recipient.
 *
 * Each (source, channel, recipient) gets its own NotificationDelivery row, and
 * each delivery is attempted, recorded, and — crucially — isolated: one channel
 * failing never blocks the others, and an already-sent delivery is skipped so
 * retries and re-fired scans don't double-send. This is what makes the three
 * channels "decoupled but working in tandem."
 *
 * Returns a per-delivery summary; it never throws, so callers (pg-boss handlers)
 * can treat a clean return as "all deliveries accounted for".
 */
export const dispatchNotification = async ({
  companyId,
  source,
  recipientUserIds,
  channels,
  content,
}: DispatchProps) => {
  const recipients = await selectUsersByIds({ userIds: recipientUserIds });
  const results: Array<{
    recipientId: string;
    channel: string;
    status: "sent" | "failed" | "skipped";
    error?: string;
  }> = [];

  for (const recipient of recipients) {
    for (const channel of channels) {
      const handler = CHANNELS[channel];
      if (!handler) {
        console.error(`Unknown notification channel: ${channel}`);
        continue;
      }

      try {
        const { delivery, alreadySent } = await claimNotificationDelivery({
          sourceType: source.type,
          sourceId: source.id,
          channel,
          recipientUserId: recipient.id,
          recipientAddress: channel === "email" ? recipient.email : undefined,
        });

        if (alreadySent) {
          results.push({ recipientId: recipient.id, channel, status: "skipped" });
          continue;
        }

        const outcome = await handler({ companyId, recipient, content });

        await markDeliveryResult({
          deliveryId: delivery.id,
          status: outcome.ok ? "sent" : "failed",
          error: outcome.error,
        });

        results.push({
          recipientId: recipient.id,
          channel,
          status: outcome.ok ? "sent" : "failed",
          error: outcome.error,
        });
      } catch (error: any) {
        // Best-effort: a single delivery blowing up must not stop the rest.
        console.error(
          `Delivery failed (${channel} -> ${recipient.id})`,
          error,
        );
        results.push({
          recipientId: recipient.id,
          channel,
          status: "failed",
          error: error?.message ?? "unknown error",
        });
      }
    }
  }

  return results;
};
