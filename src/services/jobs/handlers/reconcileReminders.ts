import { selectDueReminders } from "../../db/index.js";
import { reEnqueueReminder } from "../enqueue.js";

/**
 * Safety net for the non-transactional enqueue gap: a reminder row commits, but
 * the pg-boss send that follows could fail (crash, network blip). This scan
 * finds scheduled reminders whose time has passed and re-enqueues them. The
 * singletonKey on the dispatch job means anything already queued is untouched,
 * and delivery rows are idempotent, so re-enqueuing is always safe.
 */
export const handleReconcileReminders = async () => {
  const due = await selectDueReminders();
  if (!due.length) return;

  console.log(`[jobs] reconcile: re-enqueuing ${due.length} due reminder(s)`);
  for (const reminder of due) {
    await reEnqueueReminder({ reminderId: reminder.id });
  }
};
