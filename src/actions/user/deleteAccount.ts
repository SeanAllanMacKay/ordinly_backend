import bcrypt from "bcryptjs";
import * as z from "zod";

import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectUserRawById,
  selectActiveOwnedCompanies,
  softDeleteAccount,
  setUserHardDeleteJobId,
} from "../../services/db/index.js";
import { enqueueHardDeleteAccount } from "../../services/jobs/index.js";
import { ACCOUNT_DELETION_GRACE_DAYS } from "../../services/jobs/constants.js";
import send from "../../services/email/send.js";

const DeleteAccountSchema = z
  .object({
    userId: z.string("Invalid userId"),
    password: z.string("Your password is required to delete your account"),
    referer: z.string().optional(),
  })
  .meta({ id: "DELETE /api/user", route: "DELETE /api/user" });

export type DeleteAccountProps = z.infer<typeof DeleteAccountSchema>;

/**
 * Soft-delete the authenticated user's account and everything they own, then
 * schedule the permanent hard delete `ACCOUNT_DELETION_GRACE_DAYS` out and email
 * the user with restore instructions. Requires the current password.
 *
 * Blocked (409) while the user still owns any active non-personal company:
 * those are shared with teammates, so they must be deleted or transferred first.
 */
export const deleteAccount = async (props: DeleteAccountProps) => {
  try {
    DeleteAccountSchema.parse(props);
    const { userId, password, referer } = props;

    const user = await selectUserRawById({ userId });
    if (!user || user.deletedDate) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.UNAUTHORIZED,
        error: ["Incorrect password"],
      };
    }

    const ownedCompanies = await selectActiveOwnedCompanies({ userId });
    if (ownedCompanies.length) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.CONFLICT,
        error: [
          "Delete or transfer the companies you own before deleting your account",
        ],
      };
    }

    const result = await softDeleteAccount({ userId });
    if (!result) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    // Schedule the hard delete and remember the job id so a restore can cancel
    // it. Enqueue is non-transactional with the soft delete; the hourly
    // reconcile scan is the safety net if this send is lost.
    const job = await enqueueHardDeleteAccount({
      userId,
      deletedAt: result.deletedAt,
    });
    if (job) await setUserHardDeleteJobId({ userId, jobId: job });

    await send({
      email: user.email,
      type: "accountDeleted",
      graceDays: ACCOUNT_DELETION_GRACE_DAYS,
      referer,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Account deleted",
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
      error = ["There was an error deleting your account"],
    } = caught;

    throw { status, error };
  }
};
