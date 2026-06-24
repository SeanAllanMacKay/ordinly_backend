/** A fully-addressed email, ready to hand to a delivery provider. */
export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * The seam that decouples the app from any one email vendor. Implement this for
 * a new provider (e.g. SES, Postmark) and swap it in `providers/index.ts` —
 * nothing else in the codebase needs to change.
 *
 * `send` must throw on failure so the dispatcher can handle errors uniformly.
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}
