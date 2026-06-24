import { emailConfig } from "../config.js";
import { ResendProvider } from "./resend.js";
import type { EmailProvider } from "./types.js";

/**
 * The single place that decides which delivery provider the app uses. To switch
 * vendors, construct a different `EmailProvider` implementation here.
 */
export const emailProvider: EmailProvider = new ResendProvider(
  emailConfig.apiToken
);
