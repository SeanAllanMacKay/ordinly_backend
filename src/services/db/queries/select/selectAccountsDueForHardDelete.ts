import { and, isNotNull, lte } from "drizzle-orm";

import { db, User } from "../../index.js";

export type SelectAccountsDueForHardDeleteProps = {
  /** Soft-deleted on or before this instant are due (i.e. now - grace window). */
  before: Date;
  limit?: number;
};

/**
 * Soft-deleted accounts whose 30-day grace window has elapsed. Drives the
 * reconcile scan, which re-enqueues a hard-delete job for each (idempotent via
 * the per-user singletonKey) as a safety net for any enqueue that was lost.
 */
export const selectAccountsDueForHardDelete = async ({
  before,
  limit = 200,
}: SelectAccountsDueForHardDeleteProps) => {
  return db.query.User.findMany({
    where: and(isNotNull(User.deletedDate), lte(User.deletedDate, before)),
    columns: { id: true, deletedDate: true },
    limit,
  });
};
