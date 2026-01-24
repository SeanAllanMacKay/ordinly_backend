import { User } from "../../services/database";

import send from "../../services/email";

import type { APIResponse } from "../../routers/types";
import { HTTP_STATUSES } from "../HTTP_STATUSES";

type VerifyAccountProps = {
  code: string;
};

export const verifyAccount = async ({
  code,
}: VerifyAccountProps): Promise<APIResponse> => {
  try {
    const account = await User.findOne({ verificationCode: code });

    if (!account) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: "Account not found",
      };
    }

    if (account?.isVerified) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.CONFLICT,
        error: "Account has already been verified",
      };
    }

    account.isVerified = true;

    await send({ email: account.email, type: "accountVerified" });

    await account.save();

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Account verified",
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error verifying your account",
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
