import type { EmailType } from "../../email/index.js";

/** A recipient resolved to the address info channels need. */
export type Recipient = {
  id: string;
  name: string;
  email: string;
};

/**
 * The channel-agnostic payload for a notification. `title`/`body` drive the
 * in-app and push channels and the generic reminder email. For a specific
 * transactional email (e.g. a trial template) set `email` to override the
 * template + props the email channel uses.
 */
export type NotificationContent = {
  type: string; // notification type, e.g. "reminder", "trial_half_over"
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  referer?: string;
  cta?: { href: string; label: string };
  email?: { type: EmailType; props: Record<string, unknown> };
};

export type ChannelResult = { ok: boolean; address?: string; error?: string };

/** Every channel implements this shape. */
export type ChannelArgs = {
  companyId: string;
  recipient: Recipient;
  content: NotificationContent;
};
