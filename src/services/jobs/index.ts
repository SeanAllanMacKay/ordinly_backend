/**
 * Durable job queue (pg-boss) for reminders and scheduled emails.
 *
 * Two boot modes:
 * - `startWorker()` — start + create queues + attach workers + install crons.
 *   Used by the dedicated worker process and by `yarn dev` (inline).
 * - `startQueueClient()` — start + create queues only, no workers/crons. Used by
 *   the prod API process so it can enqueue reminders without processing jobs.
 *
 * Enqueue helpers (`enqueueReminder`, etc.) are re-exported for the action layer.
 */
import { getBoss } from "./boss.js";
import {
  ensureQueues,
  registerWork,
  registerSchedules,
} from "./register.js";

let mode: "off" | "client" | "worker" = "off";

export const startWorker = async () => {
  if (mode === "worker") return;
  const boss = getBoss();
  await boss.start();
  await ensureQueues(boss);
  await registerWork(boss);
  await registerSchedules(boss);
  mode = "worker";
  console.log("[jobs] pg-boss worker started — queues, workers, schedules ready");
};

export const startQueueClient = async () => {
  if (mode !== "off") return;
  const boss = getBoss();
  await boss.start();
  await ensureQueues(boss);
  mode = "client";
  console.log("[jobs] pg-boss queue client started — enqueue only");
};

export const stopJobs = async () => {
  if (mode === "off") return;
  await getBoss().stop();
  mode = "off";
};

export { getBoss } from "./boss.js";
export { QUEUES } from "./constants.js";
export {
  enqueueReminder,
  reEnqueueReminder,
  enqueueDispatch,
  cancelReminderJob,
  enqueueHardDeleteAccount,
  reEnqueueHardDeleteAccount,
  cancelHardDeleteJob,
} from "./enqueue.js";
