import { selectAccountsDueForHardDelete } from "../../db/index.js";
import { reEnqueueHardDeleteAccount } from "../enqueue.js";
import { ACCOUNT_DELETION_GRACE_DAYS } from "../constants.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Safety net for the non-transactional enqueue gap on account deletion: the
 * User soft-delete commits, but the pg-boss send that schedules the hard delete
 * could fail. This scan finds accounts whose grace window has elapsed and
 * re-enqueues a hard delete. The per-user singletonKey means anything already
 * scheduled is untouched, and the handler re-checks soft-delete state, so
 * re-enqueuing a restored account is harmless.
 */
export const handleReconcileAccountDeletions = async () => {
  const before = new Date(Date.now() - ACCOUNT_DELETION_GRACE_DAYS * DAY_MS);
  const due = await selectAccountsDueForHardDelete({ before });
  if (!due.length) return;

  console.log(
    `[jobs] reconcile: re-enqueuing hard delete for ${due.length} account(s)`,
  );
  for (const account of due) {
    await reEnqueueHardDeleteAccount({ userId: account.id });
  }
};
