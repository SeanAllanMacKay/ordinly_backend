/**
 * Recurring digest scan. Scaffold for periodic summary emails (e.g. a weekly
 * roundup): query the per-recipient data, then `enqueueDispatch` one job per
 * recipient with a `singletonKey` of `digest:<userId>:<period>` so a re-fired
 * cron never double-sends. Left intentionally empty until the digest content is
 * defined — the queue, schedule, and dispatch plumbing are already wired.
 */
export const handleSendDigests = async () => {
  // TODO: build digest payloads and enqueueDispatch(...) per recipient.
};
