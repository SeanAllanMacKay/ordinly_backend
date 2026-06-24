import { emailConfig } from "./config.js";
import { emailProvider } from "./providers/index.js";
import type { EmailMessage } from "./providers/types.js";
import { emailTemplates, type EmailType } from "./templates/index.js";

type SendProps = {
  email: string;
  type: EmailType;
} & { [key: string]: any };

type SendResult = {
  email: EmailMessage;
};

/**
 * Render the template for `type` and deliver it through the active provider.
 *
 * Fails soft by design: if the sender is unconfigured the call is a silent
 * no-op, and a delivery error is logged and swallowed so an email problem never
 * breaks the calling action's flow.
 */
export default async ({
  email: to,
  type,
  ...props
}: SendProps): Promise<SendResult | undefined> => {
  if (!emailConfig.from) {
    return;
  }

  const template = emailTemplates[type];
  if (!template) {
    console.error(`Unknown email type: ${type}`);
    return;
  }

  const email: EmailMessage = {
    from: emailConfig.from,
    to,
    ...template(props),
  };

  try {
    await emailProvider.send(email);
    return { email };
  } catch (error) {
    console.error(error);
    return;
  }
};
