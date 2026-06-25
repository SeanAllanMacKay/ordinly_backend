import { eq } from "drizzle-orm";

import { db, User } from "../../index.js";

/** Persist the scheduled hard-delete job id so a restore can cancel it. */
export const setUserHardDeleteJobId = async ({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}) => {
  await db
    .update(User)
    .set({ hardDeleteJobId: jobId })
    .where(eq(User.id, userId));
};
