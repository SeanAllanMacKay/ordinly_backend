// pg-boss queue names. Kept as one `as const` map so handlers, enqueue helpers,
// and the registrar all reference the same strings.
export const QUEUES = {
  DISPATCH_NOTIFICATION: "dispatch-notification",
  SCAN_TRIALS: "scan-trials",
  SEND_DIGESTS: "send-digests",
  RECONCILE_REMINDERS: "reconcile-reminders",
  HARD_DELETE_ACCOUNT: "hard-delete-account",
  RECONCILE_ACCOUNT_DELETIONS: "reconcile-account-deletions",
  DEAD_LETTER: "dead-letter",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/**
 * Days a soft-deleted account is retained before the scheduled hard delete
 * runs. The user can restore (by logging in) any time during this window.
 */
export const ACCOUNT_DELETION_GRACE_DAYS = 30;

/**
 * Robustness defaults applied to every work queue (and echoed on each enqueue so
 * behaviour holds regardless of where the option is read):
 * - retry 5× with exponential backoff before giving up,
 * - hand exhausted jobs to the dead-letter queue (nothing is silently lost),
 * - `expireInSeconds` is the visibility timeout: if a worker dies mid-job the
 *   job becomes available again and another worker retries it,
 * - retain finished jobs briefly for observability before archival.
 */
export const JOB_DEFAULTS = {
  retryLimit: 5,
  retryBackoff: true,
  retryDelay: 30,
  expireInSeconds: 120,
  retentionSeconds: 60 * 60 * 24 * 7, // 7 days
  deadLetter: QUEUES.DEAD_LETTER,
};
