import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectReminderById,
  cancelReminder as cancelReminderRow,
} from "../../../services/db/index.js";
import { assertCompanyMembership } from "../../permissions/index.js";
import { cancelReminderJob } from "../../../services/jobs/index.js";

const CancelReminderSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  reminderId: z.string("Invalid reminderId"),
});

export type CancelReminderProps = z.infer<typeof CancelReminderSchema>;

// Cancels a scheduled reminder: removes its pending queue job and soft-cancels
// the row. Only the creator may cancel their reminder.
export const cancelReminder = async (props: CancelReminderProps) => {
  try {
    CancelReminderSchema.parse(props);
    const { userId, companyId, reminderId } = props;

    await assertCompanyMembership({ userId, companyId });

    const existing = await selectReminderById({ reminderId, companyId });
    if (!existing || existing.createdBy !== userId) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Reminder not found"],
      };
    }

    if (existing.jobId) await cancelReminderJob({ jobId: existing.jobId });

    const reminder = await cancelReminderRow({ reminderId, companyId, userId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Reminder cancelled",
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
      error = ["There was an error cancelling the reminder"],
    } = caught;

    throw { status, error };
  }
};
