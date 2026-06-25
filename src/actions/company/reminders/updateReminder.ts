import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectReminderById,
  updateReminder as updateReminderRow,
  setReminderJobId,
} from "../../../services/db/index.js";
import {
  notificationChannel,
  reminderTargetType,
} from "../../../services/db/constants.js";
import { assertCompanyMembership } from "../../permissions/index.js";
import {
  cancelReminderJob,
  enqueueReminder,
} from "../../../services/jobs/index.js";

const UpdateReminderSchema = z
  .object({
    userId: z.string("Invalid userId"),
    companyId: z.string("Invalid companyId"),
    reminderId: z.string("Invalid reminderId"),
    title: z.string("Title must be a string if passed").optional(),
    body: z.string("Body must be a string if passed").optional(),
    remindAt: z.coerce.date("A valid remindAt date/time is required").optional(),
    channels: z.array(z.enum(notificationChannel)).min(1).optional(),
    recipientUserIds: z.array(z.string()).optional(),
    targetType: z.enum(reminderTargetType).optional(),
    targetId: z.string("Invalid targetId").optional(),
  })
  .meta({
    id: "PATCH /api/company/{companyId}/reminders/{reminderId}",
    route: "PATCH /api/company/{companyId}/reminders/{reminderId}",
  });

export type UpdateReminderProps = z.infer<typeof UpdateReminderSchema>;

// Edits a reminder. When the time changes, the old queue job is cancelled and a
// fresh one is scheduled so the reminder fires at the new time.
export const updateReminder = async (props: UpdateReminderProps) => {
  try {
    UpdateReminderSchema.parse(props);
    const { userId, companyId, reminderId, remindAt } = props;

    await assertCompanyMembership({ userId, companyId });

    const existing = await selectReminderById({ reminderId, companyId });
    if (!existing || existing.createdBy !== userId) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Reminder not found"],
      };
    }

    const rescheduling = remindAt !== undefined;
    if (rescheduling && remindAt.getTime() <= Date.now()) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["remindAt must be in the future"],
      };
    }

    let reminder = await updateReminderRow({
      reminderId,
      companyId,
      userId,
      title: props.title,
      body: props.body,
      remindAt,
      channels: props.channels,
      recipientUserIds: props.recipientUserIds,
      targetType: props.targetType,
      targetId: props.targetId,
    });

    if (rescheduling) {
      if (existing.jobId) await cancelReminderJob({ jobId: existing.jobId });
      try {
        const jobId = await enqueueReminder({ reminderId, remindAt });
        if (jobId) {
          await setReminderJobId({ reminderId, jobId });
          reminder = { ...reminder, jobId };
        }
      } catch (error) {
        console.error(
          "[reminders] re-enqueue failed; reconcile will recover",
          error,
        );
      }
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Reminder updated",
      reminder,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error updating the reminder"],
    } = caught;

    throw { status, error };
  }
};
