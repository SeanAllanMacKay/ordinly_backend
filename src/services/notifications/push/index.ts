import { NoopPushProvider } from "./noop.js";
import type { PushProvider } from "./types.js";

/**
 * The single place that decides which push provider the app uses. To go live,
 * construct a real `PushProvider` here (e.g. an FcmProvider) — nothing else
 * needs to change.
 */
export const pushProvider: PushProvider = new NoopPushProvider();

export type { PushProvider, PushMessage } from "./types.js";
