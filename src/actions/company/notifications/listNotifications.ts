import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectNotifications } from "../../../services/db/index.js";
import { assertCompanyMembership } from "../../permissions/index.js";

const ListNotificationsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  unreadOnly: z.coerce.boolean().optional(),
});

export type ListNotificationsProps = z.infer<typeof ListNotificationsSchema>;

// The in-app feed for the requesting user within a company. `unreadOnly` backs
// the badge.
export const listNotifications = async (props: ListNotificationsProps) => {
  try {
    ListNotificationsSchema.parse(props);
    const { userId, companyId, unreadOnly } = props;

    await assertCompanyMembership({ userId, companyId });

    const notifications = await selectNotifications({
      userId,
      companyId,
      unreadOnly,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Notifications fetched",
      notifications,
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
      error = ["There was an error fetching notifications"],
    } = caught;

    throw { status, error };
  }
};
