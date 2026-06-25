import * as z from "zod";

import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectReminders } from "../../../services/db/index.js";
import { assertCompanyMembership } from "../../permissions/index.js";

const ListRemindersSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
});

export type ListRemindersProps = z.infer<typeof ListRemindersSchema>;

// Lists the requesting user's own reminders within a company.
export const listReminders = async (props: ListRemindersProps) => {
  try {
    ListRemindersSchema.parse(props);
    const { userId, companyId } = props;

    await assertCompanyMembership({ userId, companyId });

    const reminders = await selectReminders({ companyId, createdBy: userId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Reminders fetched",
      reminders,
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
      error = ["There was an error fetching reminders"],
    } = caught;

    throw { status, error };
  }
};
