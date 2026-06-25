import { getBoss } from "./boss.js";
import {
  QUEUES,
  JOB_DEFAULTS,
  ACCOUNT_DELETION_GRACE_DAYS,
} from "./constants.js";
import type { DispatchJobData } from "./handlers/dispatchNotification.js";
import type { HardDeleteAccountJobData } from "./handlers/hardDeleteAccount.js";
import type { DispatchProps } from "../notifications/index.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Enqueue a stored reminder to fire at `remindAt`. The pg-boss job id is
 * returned so the action can persist it for later cancel/reschedule. The
 * singletonKey (keyed by reminder id) ensures the original job and any
 * reconcile re-enqueue never coexist as duplicates.
 */
export const enqueueReminder = ({
  reminderId,
  remindAt,
}: {
  reminderId: string;
  remindAt: Date;
}) => {
  const data: DispatchJobData = { kind: "reminder", reminderId };
  return getBoss().send(QUEUES.DISPATCH_NOTIFICATION, data, {
    ...JOB_DEFAULTS,
    startAfter: remindAt,
    singletonKey: `reminder:${reminderId}`,
  });
};

/**
 * Re-enqueue a reminder to run as soon as possible (reconcile path). Same
 * singletonKey as enqueueReminder, so this is a no-op if the original job is
 * still pending.
 */
export const reEnqueueReminder = ({ reminderId }: { reminderId: string }) => {
  const data: DispatchJobData = { kind: "reminder", reminderId };
  return getBoss().send(QUEUES.DISPATCH_NOTIFICATION, data, {
    ...JOB_DEFAULTS,
    singletonKey: `reminder:${reminderId}`,
  });
};

/**
 * Enqueue a ready-made dispatch payload (used by the trial/digest scans). Pass a
 * `singletonKey` to make a re-fired scan idempotent at the job level; delivery
 * rows are idempotent regardless.
 */
export const enqueueDispatch = ({
  dispatch,
  singletonKey,
}: {
  dispatch: DispatchProps;
  singletonKey?: string;
}) => {
  const data: DispatchJobData = { kind: "adhoc", dispatch };
  return getBoss().send(QUEUES.DISPATCH_NOTIFICATION, data, {
    ...JOB_DEFAULTS,
    singletonKey,
  });
};

/** Cancel a scheduled reminder's pending job (best-effort). */
export const cancelReminderJob = async ({ jobId }: { jobId: string }) => {
  try {
    await getBoss().cancel(QUEUES.DISPATCH_NOTIFICATION, jobId);
  } catch (error) {
    console.error("[jobs] failed to cancel reminder job", jobId, error);
  }
};

/**
 * Schedule the permanent hard delete of a soft-deleted account, `deletedAt` +
 * the grace window out. The singletonKey (keyed by user id) makes the original
 * schedule and any reconcile re-enqueue idempotent. Returns the job id so the
 * action can persist it for cancel-on-restore.
 */
export const enqueueHardDeleteAccount = ({
  userId,
  deletedAt,
}: {
  userId: string;
  deletedAt: Date;
}) => {
  const data: HardDeleteAccountJobData = { userId };
  return getBoss().send(QUEUES.HARD_DELETE_ACCOUNT, data, {
    ...JOB_DEFAULTS,
    startAfter: new Date(
      deletedAt.getTime() + ACCOUNT_DELETION_GRACE_DAYS * DAY_MS,
    ),
    singletonKey: `account:${userId}:hard-delete`,
  });
};

/**
 * Re-enqueue a hard delete to run as soon as possible (reconcile path). Same
 * singletonKey, so a no-op if the original job is still pending.
 */
export const reEnqueueHardDeleteAccount = ({ userId }: { userId: string }) => {
  const data: HardDeleteAccountJobData = { userId };
  return getBoss().send(QUEUES.HARD_DELETE_ACCOUNT, data, {
    ...JOB_DEFAULTS,
    singletonKey: `account:${userId}:hard-delete`,
  });
};

/** Cancel a scheduled hard-delete job on account restore (best-effort). */
export const cancelHardDeleteJob = async ({ jobId }: { jobId: string }) => {
  try {
    await getBoss().cancel(QUEUES.HARD_DELETE_ACCOUNT, jobId);
  } catch (error) {
    console.error("[jobs] failed to cancel hard-delete job", jobId, error);
  }
};
