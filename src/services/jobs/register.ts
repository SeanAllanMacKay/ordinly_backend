import type { PgBoss, Job } from "pg-boss";

import { QUEUES, JOB_DEFAULTS } from "./constants.js";
import {
  handleDispatchNotification,
  type DispatchJobData,
} from "./handlers/dispatchNotification.js";
import { handleReconcileReminders } from "./handlers/reconcileReminders.js";
import { handleScanTrials } from "./handlers/scanTrials.js";
import { handleSendDigests } from "./handlers/sendDigests.js";
import {
  handleHardDeleteAccount,
  type HardDeleteAccountJobData,
} from "./handlers/hardDeleteAccount.js";
import { handleReconcileAccountDeletions } from "./handlers/reconcileAccountDeletions.js";

// Queue-level robustness defaults (retries/backoff/expiry/dead-letter), applied
// to every work queue so the behaviour holds even for cron-triggered jobs.
const QUEUE_OPTS = {
  retryLimit: JOB_DEFAULTS.retryLimit,
  retryBackoff: JOB_DEFAULTS.retryBackoff,
  retryDelay: JOB_DEFAULTS.retryDelay,
  expireInSeconds: JOB_DEFAULTS.expireInSeconds,
  retentionSeconds: JOB_DEFAULTS.retentionSeconds,
  deadLetter: JOB_DEFAULTS.deadLetter,
};

/**
 * Create every queue. Idempotent and required before send/work in pg-boss v12,
 * so both the worker and the enqueue-only API client call this. The dead-letter
 * queue is created first since the others reference it.
 */
export const ensureQueues = async (boss: PgBoss) => {
  await boss.createQueue(QUEUES.DEAD_LETTER);
  await boss.createQueue(QUEUES.DISPATCH_NOTIFICATION, QUEUE_OPTS);
  await boss.createQueue(QUEUES.SCAN_TRIALS, QUEUE_OPTS);
  await boss.createQueue(QUEUES.SEND_DIGESTS, QUEUE_OPTS);
  await boss.createQueue(QUEUES.RECONCILE_REMINDERS, QUEUE_OPTS);
  await boss.createQueue(QUEUES.HARD_DELETE_ACCOUNT, QUEUE_OPTS);
  await boss.createQueue(QUEUES.RECONCILE_ACCOUNT_DELETIONS, QUEUE_OPTS);
};

/** Attach the worker handlers. Handlers receive a batch (array) of jobs. */
export const registerWork = async (boss: PgBoss) => {
  await boss.work<DispatchJobData>(
    QUEUES.DISPATCH_NOTIFICATION,
    async (jobs: Job<DispatchJobData>[]) => {
      for (const job of jobs) await handleDispatchNotification(job.data);
    },
  );

  await boss.work(QUEUES.SCAN_TRIALS, async () => {
    await handleScanTrials();
  });

  await boss.work(QUEUES.SEND_DIGESTS, async () => {
    await handleSendDigests();
  });

  await boss.work(QUEUES.RECONCILE_REMINDERS, async () => {
    await handleReconcileReminders();
  });

  await boss.work<HardDeleteAccountJobData>(
    QUEUES.HARD_DELETE_ACCOUNT,
    async (jobs: Job<HardDeleteAccountJobData>[]) => {
      for (const job of jobs) await handleHardDeleteAccount(job.data);
    },
  );

  await boss.work(QUEUES.RECONCILE_ACCOUNT_DELETIONS, async () => {
    await handleReconcileAccountDeletions();
  });

  // Dead-letter: log exhausted jobs so failures are visible, never silent.
  await boss.work(QUEUES.DEAD_LETTER, async (jobs: Job[]) => {
    for (const job of jobs) {
      console.error("[jobs] dead-letter", job.name, job.id, job.data);
    }
  });
};

/** Install the cron schedules (worker process only). schedule() is upsert-safe. */
export const registerSchedules = async (boss: PgBoss) => {
  await boss.schedule(QUEUES.SCAN_TRIALS, "0 9 * * *"); // daily 09:00 UTC
  await boss.schedule(QUEUES.SEND_DIGESTS, "0 8 * * 1"); // Mondays 08:00 UTC
  await boss.schedule(QUEUES.RECONCILE_REMINDERS, "*/5 * * * *"); // every 5 min
  await boss.schedule(QUEUES.RECONCILE_ACCOUNT_DELETIONS, "0 * * * *"); // hourly
};
