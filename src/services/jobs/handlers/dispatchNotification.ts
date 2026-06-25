import {
  selectReminderById,
  markReminderFired,
} from "../../db/index.js";
import {
  dispatchNotification,
  type DispatchProps,
} from "../../notifications/index.js";

// A dispatch job either points at a stored reminder (loaded fresh so a
// cancel/edit before firing is honoured) or carries a ready-made dispatch
// payload (used by the trial/digest scans).
export type DispatchJobData =
  | { kind: "reminder"; reminderId: string }
  | { kind: "adhoc"; dispatch: DispatchProps };

export const handleDispatchNotification = async (data: DispatchJobData) => {
  if (data.kind === "reminder") {
    const reminder = await selectReminderById({ reminderId: data.reminderId });

    // Cancelled/deleted before it fired, or already fired by an earlier attempt.
    if (!reminder || reminder.status !== "scheduled") return;

    await dispatchNotification({
      companyId: reminder.companyId,
      source: { type: "reminder", id: reminder.id },
      recipientUserIds: reminder.recipientUserIds,
      channels: reminder.channels,
      content: {
        type: "reminder",
        title: reminder.title,
        body: reminder.body ?? undefined,
        data: {
          reminderId: reminder.id,
          targetType: reminder.targetType,
          targetId: reminder.targetId,
        },
      },
    });

    // Recurring reminders stay "scheduled" (the cron keeps firing them); one-off
    // reminders are marked fired so the reconcile scan won't touch them again.
    await markReminderFired({
      reminderId: reminder.id,
      recurring: Boolean(reminder.recurrence),
    });
    return;
  }

  await dispatchNotification(data.dispatch);
};
