import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { markNotificationRead as markNotificationReadRow } from "../../../services/db/index.js";
import { assertCompanyMembership } from "../../permissions/index.js";

const MarkNotificationReadSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  notificationId: z.string("Invalid notificationId"),
});

export type MarkNotificationReadProps = z.infer<
  typeof MarkNotificationReadSchema
>;

// Marks one of the user's own notifications as read.
export const markNotificationRead = async (props: MarkNotificationReadProps) => {
  try {
    MarkNotificationReadSchema.parse(props);
    const { userId, companyId, notificationId } = props;

    await assertCompanyMembership({ userId, companyId });

    const notification = await markNotificationReadRow({
      notificationId,
      userId,
    });

    if (!notification) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Notification not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Notification marked read",
      notification,
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
      error = ["There was an error updating the notification"],
    } = caught;

    throw { status, error };
  }
};
