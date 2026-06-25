import { selectCompaniesForTrialMilestone } from "../../db/index.js";
import type { EmailType } from "../../email/index.js";
import { enqueueDispatch } from "../enqueue.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Trial length. There's no per-company trial-end column today, so milestones are
// derived from Company.createdDate + this fixed length. Adjust via env if the
// real trial length differs, or replace the window math once a trialEndsAt field
// exists.
const TRIAL_DAYS = Number(process.env.FREE_TRIAL_DAYS) || 14;

type Milestone = {
  key: string;
  ageDays: number;
  // Fixed template, or a resolver for milestones whose email depends on state.
  template?: EmailType;
  resolveTemplate?: (hasActiveSubscription: boolean) => EmailType;
  title: string;
};

const MILESTONES: Milestone[] = [
  {
    key: "trial_half_over",
    ageDays: Math.floor(TRIAL_DAYS / 2),
    template: "companyFreeTrialHalfOver",
    title: "You're halfway through your free trial",
  },
  {
    key: "trial_two_days_left",
    ageDays: TRIAL_DAYS - 2,
    template: "companyFreeTrialOverInTwoDays",
    title: "Your free trial ends in 2 days",
  },
  {
    key: "trial_expired",
    ageDays: TRIAL_DAYS,
    resolveTemplate: (hasActiveSubscription) =>
      hasActiveSubscription
        ? "companyFreeTrialExpiredWithSubscription"
        : "companyFreeTrialExpiredNoSubscription",
    title: "Your free trial has ended",
  },
];

/**
 * Daily scan that fires the trial-milestone emails (finally wiring up the
 * orphaned trial templates). For each milestone it selects the companies whose
 * trial crosses that milestone in the last 24h and enqueues a dispatch to the
 * owner. The synthetic source id (milestone + company + day) makes both the job
 * and its deliveries idempotent, so a re-run never double-sends.
 */
export const handleScanTrials = async () => {
  const now = Date.now();
  const bucket = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD

  for (const milestone of MILESTONES) {
    const createdFrom = new Date(now - (milestone.ageDays + 1) * DAY_MS);
    const createdTo = new Date(now - milestone.ageDays * DAY_MS);

    const companies = await selectCompaniesForTrialMilestone({
      createdFrom,
      createdTo,
    });

    for (const company of companies) {
      const template =
        milestone.template ??
        milestone.resolveTemplate!(company.hasActiveSubscription);

      await enqueueDispatch({
        singletonKey: `${milestone.key}:${company.companyId}:${bucket}`,
        dispatch: {
          companyId: company.companyId,
          source: {
            type: "system",
            id: `${milestone.key}:${company.companyId}:${bucket}`,
          },
          recipientUserIds: [company.ownerId],
          channels: ["email", "in_app"],
          content: {
            type: milestone.key,
            title: milestone.title,
            body: `${company.companyName}: ${milestone.title.toLowerCase()}.`,
            email: {
              type: template,
              props: { companyName: company.companyName },
            },
          },
        },
      });
    }

    if (companies.length) {
      console.log(
        `[jobs] scan-trials: enqueued ${companies.length} "${milestone.key}" email(s)`,
      );
    }
  }
};
