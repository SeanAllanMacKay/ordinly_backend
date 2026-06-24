/**
 * Public entry point for the email service. Import the default `send` from here:
 *
 *   import send from "../../services/email/index.js";
 *   await send({ email, type: "successfulSignUp", verificationCode, referer });
 *
 * The provider (currently Resend) lives behind the EmailProvider seam in
 * `providers/` and can be swapped without touching any call site.
 */
export { default } from "./send.js";

export type { EmailType } from "./templates/index.js";
export type { EmailMessage, EmailProvider } from "./providers/types.js";
