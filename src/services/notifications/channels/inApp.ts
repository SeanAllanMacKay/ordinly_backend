import { insertNotification } from "../../db/index.js";
import type { ChannelArgs, ChannelResult } from "./types.js";

// In-app channel — writes a row to the notification feed the frontend reads.
export const sendInAppChannel = async ({
  companyId,
  recipient,
  content,
}: ChannelArgs): Promise<ChannelResult> => {
  await insertNotification({
    companyId,
    userId: recipient.id,
    type: content.type,
    title: content.title,
    body: content.body,
    data: content.data,
  });

  return { ok: true };
};
