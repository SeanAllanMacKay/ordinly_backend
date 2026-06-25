import { pushProvider } from "../push/index.js";
import type { ChannelArgs, ChannelResult } from "./types.js";

// Push channel — delegates to the push provider seam. Device-token lookup lands
// here once tokens are stored; for now the recipient id stands in as the token
// and the default no-op provider logs. The seam means real push (FCM/APNs/web-
// push) can be added without changing dispatch or call sites.
export const sendPushChannel = async ({
  recipient,
  content,
}: ChannelArgs): Promise<ChannelResult> => {
  const token = recipient.id; // placeholder until device tokens are persisted

  await pushProvider.send({
    token,
    title: content.title,
    body: content.body,
    data: content.data,
  });

  return { ok: true, address: token };
};
