import type { PushProvider, PushMessage } from "./types.js";

/**
 * Default no-op push provider. Logs instead of delivering, so push can ship as a
 * stub today and be swapped for FCM/APNs/web-push later without touching the
 * dispatch layer. Until a real provider is wired and device tokens are stored,
 * push deliveries are effectively a recorded no-op.
 */
export class NoopPushProvider implements PushProvider {
  async send(message: PushMessage): Promise<void> {
    console.log(
      `[push:noop] would deliver "${message.title}" to token ${message.token}`,
    );
  }
}
