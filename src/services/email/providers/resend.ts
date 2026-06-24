import { Resend } from "resend";

import type { EmailProvider, EmailMessage } from "./types.js";

/** Resend-backed implementation of the EmailProvider seam. */
export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private client?: Resend;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(message: EmailMessage): Promise<void> {
    // Construct the SDK lazily: it throws on an empty key, so deferring it to
    // send time keeps a misconfigured environment from crashing app startup.
    if (!this.client) {
      this.client = new Resend(this.apiKey);
    }

    // The SDK resolves with `{ data, error }` rather than throwing — normalize
    // a delivery error into a throw so callers handle failures consistently.
    const { error } = await this.client.emails.send(message);
    if (error) {
      throw error;
    }
  }
}
