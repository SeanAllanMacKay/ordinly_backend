import send from "../../email/index.js";
import type { ChannelArgs, ChannelResult } from "./types.js";

// Email channel — reuses the existing fail-soft email service. For a specific
// transactional template the caller sets `content.email`; otherwise the generic
// `reminder` template renders the free-form title/body.
export const sendEmailChannel = async ({
  recipient,
  content,
}: ChannelArgs): Promise<ChannelResult> => {
  const { email, title, body, referer, cta } = content;

  const result = email
    ? await send({ email: recipient.email, type: email.type, ...email.props })
    : await send({
        email: recipient.email,
        type: "reminder",
        title,
        body,
        referer,
        cta,
      });

  // send() returns the message on success and undefined on failure / when the
  // sender is unconfigured. Surface that as the delivery outcome.
  if (!result) {
    return { ok: false, address: recipient.email, error: "email not delivered" };
  }

  return { ok: true, address: recipient.email };
};
