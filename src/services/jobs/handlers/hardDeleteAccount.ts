import { hardDeleteAccount, selectUserRawById } from "../../db/index.js";

export type HardDeleteAccountJobData = {
  userId: string;
};

/**
 * Permanently erase an account after its grace window. Guards on the user still
 * being soft-deleted: if they restored (logged in) during the window the row's
 * `deletedDate` is cleared and this is a no-op, so a stale or reconciled job
 * never deletes a revived account.
 */
export const handleHardDeleteAccount = async ({
  userId,
}: HardDeleteAccountJobData) => {
  const user = await selectUserRawById({ userId });

  if (!user) return; // already hard-deleted/anonymised
  if (!user.deletedDate) return; // restored during the grace window

  console.log(`[jobs] hard-deleting account ${userId}`);
  await hardDeleteAccount({ userId });
};
