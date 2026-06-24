const name: string = process.env["EMAIL_FROM_NAME"] || "";
const address: string = process.env["EMAIL_FROM_ADDRESS"] || "";

/**
 * Provider-agnostic email configuration sourced from the environment.
 * `from` uses the `Name <email>` format that providers like Resend accept,
 * falling back to the bare address when no display name is configured.
 */
export const emailConfig = {
  apiToken: process.env["EMAIL_API_TOKEN"] || "",
  from: name && address ? `${name} <${address}>` : address,
};
