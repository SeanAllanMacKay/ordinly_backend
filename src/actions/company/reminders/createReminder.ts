import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  insertReminder,
  setReminderJobId,
  selectCompanyMember,
} from "../../../services/db/index.js";
import {
  notificationChannel,
  reminderTargetType,
} from "../../../services/db/constants.js";
import { assertCompanyMembership } from "../../permissions/index.js";
import { enqueueReminder } from "../../../services/jobs/index.js";

const CreateReminderSchema = z
  .object({
    userId: z.string("Invalid userId"),
    companyId: z.string("Invalid companyId"),
    title: z.string("Title is required"),
    body: z.string("Body must be a string if passed").optional(),
    remindAt: z.coerce.date("A valid remindAt date/time is required"),
    channels: z.array(z.enum(notificationChannel)).min(1).optional(),
    recipientUserIds: z.array(z.string()).optional(),
    targetType: z.enum(reminderTargetType).optional(),
    targetId: z.string("Invalid targetId").optional(),
  })
  .meta({
    id: "POST /api/company/{companyId}/reminders",
    route: "POST /api/company/{companyId}/reminders",
  });

export type CreateReminderProps = z.infer<typeof CreateReminderSchema>;

// Creates a reminder and schedules it on the durable queue. The row is the
// source of truth: it's inserted first, then enqueued. If the enqueue fails
// after the row commits, the reconcile scan re-enqueues it — so a reminder is
// never silently lost.
export const createReminder = async (props: CreateReminderProps) => {
  try {
    CreateReminderSchema.parse(props);

    const { userId, companyId, title, body, remindAt, targetType, targetId } =
      props;

    await assertCompanyMembership({ userId, companyId });

    if (remindAt.getTime() <= Date.now()) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["remindAt must be in the future"],
      };
    }

    const channels = props.channels ?? ["email", "in_app"];

    // Default to notifying the creator. Any explicit recipients must be members
    // of the same company (so a reminder can't notify arbitrary users).
    const recipientUserIds = props.recipientUserIds?.length
      ? props.recipientUserIds
      : [userId];

    for (const recipientId of recipientUserIds) {
      if (recipientId === userId) continue;
      const { exists } = await selectCompanyMember({
        userId: recipientId,
        companyId,
      });
      if (!exists) {
        throw {
          status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
          error: [`Recipient ${recipientId} is not a member of this company`],
        };
      }
    }

    const reminder = await insertReminder({
      companyId,
      userId,
      title,
      body,
      remindAt,
      channels,
      recipientUserIds,
      targetType,
      targetId,
    });

    try {
      const jobId = await enqueueReminder({
        reminderId: reminder.id,
        remindAt,
      });
      if (jobId) await setReminderJobId({ reminderId: reminder.id, jobId });
    } catch (error) {
      // Non-fatal: the reminder is persisted; the reconcile scan will enqueue it.
      console.error("[reminders] enqueue failed; reconcile will recover", error);
    }

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Reminder scheduled",
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
      error = ["There was an error scheduling the reminder"],
    } = caught;

    throw { status, error };
  }
};
