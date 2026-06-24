import send from "../../services/email/index.js";
import type { APIResponse } from "../../routers/types.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import {
  selectUserByVerificationCode,
  updateUserById,
} from "../../services/db/index.js";
import * as z from "zod";

const VerifyAccountSchema = z.object({
  code: z.string("Invalid code"),
  referer: z.string().optional(),
}).meta({ id: "POST /api/user/verify-account", route: "POST /api/user/verify-account" });

type VerifyAccountProps = {
  code: string;
  referer?: string;
};

export const verifyAccount = async ({
  code,
  referer,
}: VerifyAccountProps): Promise<APIResponse> => {
  try {
    VerifyAccountSchema.parse({ code, referer });

    const account = await selectUserByVerificationCode({
      verificationCode: code,
    });

    if (!account) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    if (account?.isVerified) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.CONFLICT,
        error: ["Account has already been verified"],
      };
    }

    updateUserById({ userId: account.id, isVerified: true });

    await send({ email: account.email, type: "accountVerified", referer });

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Account verified",
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
      error = ["There was an error verifying your account"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
