/** A push notification ready to hand to a delivery provider. */
export type PushMessage = {
  token: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
};

/**
 * The seam that decouples the app from any one push vendor. Implement this for a
 * real provider (FCM, APNs, web-push) and swap it in `push/index.ts` — nothing
 * in the dispatch layer or call sites changes. Mirrors the EmailProvider seam.
 *
 * `send` must throw on failure so the dispatcher records the delivery as failed.
 */
export interface PushProvider {
  send(message: PushMessage): Promise<void>;
}
